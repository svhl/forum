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

const Dashboard = () => {
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const [activeTab, setActiveTab] = useState("rules");
	const [posts, setPosts] = useState([]);
	const [loggedInUser, setLoggedInUser] = useState(null);
	const [newMessage, setNewMessage] = useState("");
	const [postCooldownUntil, setPostCooldownUntil] = useState(0);
	const postsListRef = useRef(null);
	const prevTabRef = useRef(activeTab);
	const [shouldStickToBottom, setShouldStickToBottom] = useState(true);
	const [rightbarVisible, setRightbarVisible] = useState(false);
	const [sidebarPointerEnabled, setSidebarPointerEnabled] = useState(false);

	function renderPostBody(body) {
		// Split by double newlines for paragraphs
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
				{
					// Split by single newlines for line breaks
					para.split("\n").reduce((acc, line, i) => {
						if (i > 0) acc.push(<br key={i} />);
						acc.push(line);
						return acc;
					}, [])
				}
			</p>
		));
	}

	// I have no idea what this does, but it makes the sidebar hover appear smoooooth
	useEffect(() => {
		const handleMouseMove = (e) => {
			const sidebar = document.querySelector(".dashboard-sidebar");
			const sidebarRect = sidebar
				? sidebar.getBoundingClientRect()
				: null;
			if (e.clientX <= 40) {
				setSidebarVisible(true);
			} else if (
				sidebarRect &&
				(e.clientX < sidebarRect.left ||
					e.clientX > sidebarRect.right ||
					e.clientY < sidebarRect.top ||
					e.clientY > sidebarRect.bottom)
			) {
				setSidebarVisible(false);
			}
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	useEffect(() => {
		fetch("http://localhost:5000/api/check-auth", {
			credentials: "include",
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.loggedIn) setLoggedInUser(data.username);
			})
			.catch(() => setLoggedInUser(null));
	}, []);

	useEffect(() => {
		let intervalId;

		const fetchPosts = () => {
			if (activeTab === "rules") {
				fetch("http://localhost:5000/api/rules")
					.then((res) => res.json())
					.then((data) => setPosts(data))
					.catch(() => setPosts([]));
			} else {
				fetch(`http://localhost:5000/api/topic/${activeTab}`)
					.then((res) => res.json())
					.then((data) => setPosts(data))
					.catch(() => setPosts([]));
			}
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
		if (!postsListRef.current) return;
		if (shouldStickToBottom) {
			postsListRef.current.scrollTop = postsListRef.current.scrollHeight;
		}
	}, [posts, shouldStickToBottom]);

	const handleScroll = () => {
		if (!postsListRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = postsListRef.current;
		setShouldStickToBottom(scrollTop + clientHeight >= scrollHeight - 2);
	};

	// On mount, fetch cooldown from server (by checking user info)
	useEffect(() => {
		if (!loggedInUser) return;
		// Fetch user info to get cooldownUntil
		fetch("http://localhost:5000/api/check-auth", {
			credentials: "include",
		})
			.then((res) => res.json())
			.then(() => {
				// Optionally, you could create a dedicated endpoint to get cooldownUntil
				// For now, fetch on post error and success
			});
	}, [loggedInUser]);

	// Timer to update cooldown
	useEffect(() => {
		if (!postCooldownUntil) return;
		const interval = setInterval(() => {
			if (Date.now() >= postCooldownUntil) {
				setPostCooldownUntil(0);
			}
		}, 500);
		return () => clearInterval(interval);
	}, [postCooldownUntil]);

	const handlePost = async () => {
		if (!newMessage.trim()) return;
		if (postCooldownUntil && Date.now() < postCooldownUntil) return;

		try {
			const res = await fetch("http://localhost:5000/api/post", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					topic: activeTab,
					body: newMessage.trim(),
				}),
			});
			const data = await res.json();

			if (res.status === 403 && data.message) {
				window.alert(data.message); // Show banned popup here
				return;
			}

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

	const handleLogout = async () => {
		try {
			await fetch("http://localhost:5000/api/logout", {
				method: "POST",
				credentials: "include",
			});
			window.alert("Successfully logged out!");
			window.location.href = "/";
		} catch {
			window.alert("Error logging out.");
		}
	};

	useEffect(() => {
		let timer;
		if (sidebarVisible) {
			timer = setTimeout(() => setSidebarPointerEnabled(true), 500);
		} else {
			setSidebarPointerEnabled(false);
		}
		return () => clearTimeout(timer);
	}, [sidebarVisible]);

	return (
		<div className="dashboard-root">
			<aside
				className={`dashboard-sidebar${
					sidebarVisible ? " visible" : ""
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
				{activeTab === "rules" ? (
					<>
						{posts.length > 0 && (
							<div
								className="posts-list"
								ref={postsListRef}
								onScroll={handleScroll}
							>
								{posts.map((post, idx) => (
									<div className="post" key={post._id || idx}>
										<div className="post-meta">
											<span
												className="post-username"
												style={{
													color:
														post.color || "#b5b5b5",
												}}
											>
												{post.username}
											</span>
											<span className="post-date">
												{post.createdAt
													? new Date(post.createdAt)
															.toLocaleString(
																"en-US",
																{
																	month: "short",
																	day: "numeric",
																	hour: "numeric",
																	minute: "2-digit",
																	hour12: true,
																}
															)
															.replace(",", " 🞄")
													: ""}
											</span>
										</div>
										<div className="post-body">
											{renderPostBody(post.body)}
										</div>
									</div>
								))}
							</div>
						)}
						<div className="admin-message">
							Only admins can post in this channel.
						</div>
					</>
				) : (
					<>
						{posts.length > 0 && (
							<div
								className="posts-list"
								ref={postsListRef}
								onScroll={handleScroll}
							>
								{posts.map((post, idx) => (
									<div className="post" key={post._id || idx}>
										<div className="post-meta">
											<span
												className="post-username"
												style={{
													color:
														post.color || "#b5b5b5",
												}}
											>
												{post.username}
											</span>
											<span className="post-date">
												{post.createdAt
													? new Date(post.createdAt)
															.toLocaleString(
																"en-US",
																{
																	month: "short",
																	day: "numeric",
																	hour: "numeric",
																	minute: "2-digit",
																	hour12: true,
																}
															)
															.replace(",", " 🞄")
													: ""}
											</span>
										</div>
										<div className="post-body">
											{renderPostBody(post.body)}
										</div>
									</div>
								))}
							</div>
						)}
						{loggedInUser && (
							<div className="post-input-container">
								<textarea
									placeholder="Start typing..."
									value={newMessage}
									onChange={(e) =>
										setNewMessage(e.target.value)
									}
									className="post-input"
									rows={2}
									style={{
										resize: "none",
										overflowX: "hidden",
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											if (
												postCooldownUntil &&
												Date.now() < postCooldownUntil
											) {
												window.alert(
													`Please wait ${Math.ceil(
														(postCooldownUntil -
															Date.now()) /
															1000
													)}s before posting again.`
												);
											} else {
												handlePost();
											}
										}
									}}
								/>
								<button
									onClick={() => {
										if (
											postCooldownUntil &&
											Date.now() < postCooldownUntil
										) {
											window.alert(
												`Please wait ${Math.ceil(
													(postCooldownUntil -
														Date.now()) /
														1000
												)}s before posting again.`
											);
										} else {
											handlePost();
										}
									}}
									className="post-send-btn"
								>
									Send
								</button>
							</div>
						)}
					</>
				)}
			</main>
			{/* Right sidebar for logout, tucked away and only visible on hover */}
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

export default Dashboard;
