import React, {useState} from 'react';

function Login({onLogin}) {
    const [loginInfo, setLoginInfo] = useState({username: '', password: ''});

    const handleChange = (e) => {
        e.preventDefault();
        const {username, password} = loginInfo;

        //hardcode user account for now
        if(username === "test" && password === "tester123") {
            onLogin(true);
        } else {
            alert("The username or password does not exist.");
        }
    };

return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;