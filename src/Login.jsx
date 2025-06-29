import React, { useState } from "react";
import "./SignUpAndLogin.css";
import ShinyText from "./ShinyText.jsx";

const Login = ({ onClose }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	// Clear fields and close
	const handleClose = () => {
		setUsername("");
		setPassword("");
		onClose();
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!username || !password) {
			window.alert("Please provide both username and password.");
			return;
		}
		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // Include cookies for session management
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (res.ok) {
				// Redirect based on admin status
				if (data.admin) {
					window.location.href = "/admindashboard";
				} else {
					window.location.href = "/dashboard";
				}
			} else {
				window.alert(data.message || "Login failed.");
			}
		} catch {
			window.alert("Could not connect to server.");
		}
	};

	return (
		<div className="signup-container">
			<ShinyText text="Login" className="signup-heading" />
			<form className="signup-form" onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Username"
					className="signup-input"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					type="password"
					placeholder="Password"
					className="signup-input"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<div className="button-group-2">
					<button type="submit" className="signup-submit-btn">
						Login
					</button>
					<button
						type="button"
						className="signup-close-btn"
						onClick={handleClose}
					>
						Back
					</button>
				</div>
			</form>
		</div>
	);
};

export default Login;
