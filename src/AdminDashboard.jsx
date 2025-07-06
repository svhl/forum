import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import "./Dashboard.css";

const TABS = ["rules", "technology", "movies", "music", "gaming", "other"];
const TAGLINES = [
	"Forum rules and guidelines",
	"Discuss the latest in tech",
	"Share and review movies",
	"Talk about your favorite music",
	"All things gaming",
	"For all other topics",
];

const AdminDashboard = () => {
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const [activeTab, setActiveTab] = useState("rules");
	const [posts, setPosts] = useState([]);
	const [loggedInUser, setLoggedInUser] = useState(null);
	const [newMessage, setNewMessage] = useState("");
	const [postCooldownUntil, setPostCooldownUntil] = useState(0);
	const postsListRef = useRef(null);
	const [shouldStickToBottom, setShouldStickToBottom] = useState(true);
	const [rightbarVisible, setRightbarVisible] = useState(false);
	const [hoveredPostId, setHoveredPostId] = useState(null);
	const [sidebarPointerEnabled, setSidebarPointerEnabled] = useState(false);

	const prevTabRef = useRef(activeTab);

	useEffect(() => {
		fetch("/api/check-auth", {
			credentials: "include",
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.username) setLoggedInUser(data.username);
				else window.location.href = "/";
			});
	}, []);

	useEffect(() => {
		let intervalId;

		const fetchPosts = () => {
			fetch(
				`/api/${
					activeTab === "rules" ? "rules" : `topic/${activeTab}`
				}`,
				{ credentials: "include" }
			)
				.then((res) => res.json())
				.then((data) => setPosts(data || []))
				.catch(() => setPosts([]));
		};

		fetchPosts();
		intervalId = setInterval(fetchPosts, 5000);

		return () => clearInterval(intervalId);
	}, [activeTab]);

	useLayoutEffect(() => {
		if (
			postsListRef.current &&
			posts.length > 0 &&
			prevTabRef.current !== activeTab
		) {
			postsListRef.current.scrollTop = postsListRef.current.scrollHeight;
			prevTabRef.current = activeTab;
		}
	}, [posts, activeTab]);

	useEffect(() => {
		if (shouldStickToBottom && postsListRef.current) {
			postsListRef.current.scrollTop = postsListRef.current.scrollHeight;
		}
	}, [posts, shouldStickToBottom]);

	useEffect(() => {
		if (!postCooldownUntil) return;
		const interval = setInterval(() => {
			if (Date.now() >= postCooldownUntil) {
				setPostCooldownUntil(0);
			}
		}, 500);
		return () => clearInterval(interval);
	}, [postCooldownUntil]);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (e.clientX <= 40) setSidebarVisible(true);
			else if (e.clientX > 152) setSidebarVisible(false);
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	useEffect(() => {
		let timer;
		if (sidebarVisible) {
			timer = setTimeout(() => setSidebarPointerEnabled(true), 500);
		} else {
			setSidebarPointerEnabled(false);
		}
		return () => clearTimeout(timer);
	}, [sidebarVisible]);

	function renderPostBody(body) {
		const paragraphs = body.split(/\n{2,}/);
		return paragraphs.map((para, idx) => (
			<p
				key={idx}
				style={{
					margin: 0,
					marginBottom: "1em",
					whiteSpace: "pre-wrap",
				}}
			>
				{para.split("\n").reduce((acc, line, i) => {
					if (i > 0) acc.push(<br key={i} />);
					acc.push(line);
					return acc;
				}, [])}
			</p>
		));
	}

	const handleScroll = () => {
		if (!postsListRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = postsListRef.current;
		setShouldStickToBottom(scrollTop + clientHeight >= scrollHeight - 0);
	};

	const handlePost = async () => {
		if (!newMessage.trim()) return;
		if (postCooldownUntil && Date.now() < postCooldownUntil) {
			window.alert(
				`Please wait ${Math.ceil(
					(postCooldownUntil - Date.now()) / 1000
				)}s before posting again.`
			);
			return;
		}
		try {
			const res = await fetch("/api/post", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					topic: activeTab,
					body: newMessage.trim(),
				}),
			});
			const data = await res.json();
			if (res.ok) {
				setPosts([
					...posts,
					{
						username: loggedInUser,
						body: newMessage.trim(),
						createdAt: new Date().toISOString(),
					},
				]);
				setNewMessage("");
				if (data.cooldown) setPostCooldownUntil(data.cooldown);
			} else {
				if (data.cooldown) setPostCooldownUntil(data.cooldown);
				window.alert(data.message || "Failed to post.");
			}
		} catch {
			window.alert("Could not connect to server.");
		}
	};

	const handleDelete = async (postId) => {
		if (!window.confirm("Are you sure you want to delete this post?"))
			return;
		try {
			const res = await fetch("/api/delete-post", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ topic: activeTab, postId }),
			});
			const data = await res.json();
			if (res.ok) {
				setPosts(posts.filter((post) => post._id !== postId));
			} else {
				window.alert(data.message || "Failed to delete post.");
			}
		} catch {
			window.alert("Could not connect to server.");
		}
	};

	const handleBanUser = async (username) => {
		if (username === loggedInUser) {
			window.alert("You can't ban yourself.");
			return;
		}

		// 🔁 Ask for confirmation BEFORE sending the request
		const confirmed = window.confirm(
			`Are you sure you want to ban user "${username}"?`
		);
		if (!confirmed) return;

		try {
			const res = await fetch("/api/ban-user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ username }),
			});

			const data = await res.json();

			if (!res.ok) {
				window.alert(data.message || "Failed to ban user.");
				return;
			}

			window.alert(`User "${username}" has been banned.`);
		} catch {
			window.alert("Could not connect to server.");
		}
	};

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/logout", {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				window.alert("Successfully logged out!");
				window.location.href = "/";
			} else {
				window.alert("Error logging out.");
			}
		} catch {
			window.alert("Error logging out.");
		}
	};

	return (
		<div className="dashboard-root">
			<aside
				className={`dashboard-sidebar ${
					sidebarVisible ? "visible" : ""
				}${sidebarPointerEnabled ? " sidebar-pointer-enabled" : ""}`}
				onMouseEnter={() => setSidebarVisible(true)}
			>
				{TABS.map((tab) => (
					<div
						key={tab}
						className={`sidebar-tab ${
							activeTab === tab ? "active" : ""
						}`}
						onClick={() =>
							sidebarPointerEnabled ? setActiveTab(tab) : null
						}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
					</div>
				))}
			</aside>
			<main className="dashboard-main">
				<h2 className="dashboard-title">
					{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
					<span className="dashboard-tagline">
						{TAGLINES[TABS.indexOf(activeTab)]}
					</span>
				</h2>
				{posts.length > 0 && (
					<div
						className="posts-list"
						ref={postsListRef}
						onScroll={handleScroll}
					>
						{posts.map((post, idx) => (
							<div
								className="post"
								key={post._id || idx}
								onMouseEnter={() => setHoveredPostId(post._id)}
								onMouseLeave={() => setHoveredPostId(null)}
								style={{ position: "relative" }}
							>
								<div className="post-meta">
									<span
										className="post-username"
										style={{
											color: post.color || "#b5b5b5",
										}}
									>
										{post.username}
									</span>
									<span className="post-date">
										{post.createdAt
											? new Date(post.createdAt)
													.toLocaleString("en-US", {
														month: "short",
														day: "numeric",
														hour: "numeric",
														minute: "2-digit",
														hour12: true,
													})
													.replace(",", " 🞄")
											: ""}
									</span>
								</div>
								<div className="post-body">
									{renderPostBody(post.body)}
								</div>
								{hoveredPostId === post._id && (
									<div
										style={{
											display: "flex",
											gap: "8px",
											position: "absolute",
											right: 8,
											top: 8,
										}}
									>
										<div
											className="post-ban-btn"
											onClick={() =>
												handleBanUser(post.username)
											}
										>
											Ban
										</div>
										<div
											className="post-delete-btn"
											onClick={() =>
												handleDelete(post._id)
											}
										>
											Delete
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
				{loggedInUser && (
					<div className="post-input-container">
						<textarea
							placeholder="Start typing..."
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							className="post-input"
							rows={2}
							style={{ resize: "none", overflowX: "hidden" }}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handlePost();
								}
							}}
						/>
						<button onClick={handlePost} className="post-send-btn">
							Send
						</button>
					</div>
				)}
			</main>
			{loggedInUser && (
				<aside
					className={`dashboard-rightbar${
						rightbarVisible ? " visible" : ""
					}`}
					onMouseEnter={() => setRightbarVisible(true)}
					onMouseLeave={() => setRightbarVisible(false)}
				>
					<div className="rightbar-logout" onClick={handleLogout}>
						Logout
					</div>
				</aside>
			)}
			{activeTab !== "rules" && (
				<div className="dashboard-bottom-message">
					Join the conversation?<a href="./">Login</a>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;