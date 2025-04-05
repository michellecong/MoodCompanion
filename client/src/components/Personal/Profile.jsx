import React, { useState, useEffect } from "react";
import api from "../../api/axios";

// 用户资料组件
export const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profilePicture: "",
  });

  // 加载用户数据
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setProfile(response.data.data);
        setFormData({
          username: response.data.data.username,
          email: response.data.data.email,
          profilePicture: response.data.data.profilePicture,
        });
        setLoading(false);
      } catch (err) {
        setError("获取个人资料失败");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // 如果正在编辑，取消编辑时恢复原始数据
      setFormData({
        username: profile.username,
        email: profile.email,
        profilePicture: profile.profilePicture,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.put("/users/profile", formData);
      setProfile(response.data.data);
      setIsEditing(false);

      // 更新本地存储的用户信息
      const user = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.message || "更新个人资料失败");
    }
  };

  if (loading) {
    return <div className="text-center py-10">加载中...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">个人资料</h2>
        <button
          onClick={handleEditToggle}
          className={`font-bold py-2 px-4 rounded ${
            isEditing
              ? "bg-gray-500 hover:bg-gray-700 text-white"
              : "bg-blue-500 hover:bg-blue-700 text-white"
          }`}
        >
          {isEditing ? "取消" : "编辑资料"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              用户名
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              minLength="3"
              maxLength="30"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              邮箱
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="profilePicture"
            >
              头像URL
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="profilePicture"
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleEditToggle}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              保存
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex items-center mb-6">
            <img
              src={profile.profilePicture || "/default-avatar.png"}
              alt={profile.username}
              className="w-24 h-24 rounded-full mr-6 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
            <div>
              <h3 className="text-xl font-bold">{profile.username}</h3>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">
                加入时间: {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h4 className="font-bold mb-2">账户信息</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">用户名</p>
                <p>{profile.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">邮箱</p>
                <p>{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">用户角色</p>
                <p className="capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">上次登录</p>
                <p>{new Date(profile.lastLogin).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {profile.journals && profile.journals.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold mb-2">
                我的日记 ({profile.journals.length})
              </h4>
              <div className="space-y-2">
                {profile.journals.map((journal) => (
                  <div
                    key={journal._id}
                    className="p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">{journal.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(journal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 修改密码部分 */}
      <ChangePassword />

      {/* 删除账户部分 */}
      <DeleteAccount />
    </div>
  );
};

// 修改密码组件
const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { currentPassword, newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 验证新密码匹配
    if (newPassword !== confirmPassword) {
      return setError("新密码不匹配");
    }

    setLoading(true);

    try {
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccess("密码已成功更新");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(false);

      // 3秒后关闭成功消息
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "更新密码失败");
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-blue-500 hover:text-blue-700 font-medium"
      >
        <span>{isOpen ? "取消修改密码" : "修改密码"}</span>
        <svg
          className={`ml-2 w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="currentPassword"
              >
                当前密码
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="newPassword"
              >
                新密码
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newPassword"
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirmPassword"
              >
                确认新密码
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? "更新中..." : "更新密码"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// 删除账户组件
const DeleteAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 二次确认
    if (confirmText !== "确认删除我的账户") {
      return setError("请输入确认文本");
    }

    setLoading(true);

    try {
      await api.delete("/users/account", {
        data: { password },
      });

      // 清除本地存储
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 重定向到登录页
      window.location.href = "/login";
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "删除账户失败");
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-red-500 hover:text-red-700 font-medium"
      >
        <span>{isOpen ? "取消删除账户" : "删除账户"}</span>
        <svg
          className={`ml-2 w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>警告:</strong>{" "}
                  账户删除是永久的，无法恢复。所有相关数据将被删除。
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                确认密码
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirmText"
              >
                请输入 "确认删除我的账户" 以确认
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading || confirmText !== "确认删除我的账户"}
              >
                {loading ? "处理中..." : "永久删除我的账户"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
