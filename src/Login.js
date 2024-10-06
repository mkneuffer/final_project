import React, {useState} from 'react';

function Login({onLogin}) {
    const [loginInfo, setLoginInfo] = useState({username: '', password: ''});

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setLoginInfo({
          ...loginInfo,
          [id]: value
        });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
    
        // Hardcoded login for now
        if (loginInfo.username === 'test' && loginInfo.password === 'tester123') {
          onLogin(true);
        } else {
          alert('The username or password does not exist.');
        }
      };

return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="username"
          placeholder="Username"
          value={loginInfo.username}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={loginInfo.password}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;