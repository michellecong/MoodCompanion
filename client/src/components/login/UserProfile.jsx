import { useEffect, useState } from "react";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in first.");
      return;
    }

    fetch("http://localhost:5000/api/user", {
      headers: { Authorization: token },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setError("Error fetching user data"));
  }, []);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}

export default UserProfile;
