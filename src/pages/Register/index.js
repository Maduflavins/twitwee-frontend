import React, { useState, useContext } from 'react'
import { v1 as genId } from 'uuid'
import Axios from 'axios'
import { Link, Redirect } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import { BASE_URL } from '../../config'
import './style.css'

import { Context as NotificationContext } from '../../context/Notification'
import { Context as AuthContext } from '../../context/Auth'
import { ADD_NOTI, LOGIN_USER } from '../../context/actionTypes'

export default () => {
  const { setNotification } = useContext(NotificationContext)
  const { setAuthUser } = useContext(AuthContext)
  const [login, setLogin] = useState(false)

  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: ''
  })

  const updateUser = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value })
  }

  const setCookie = (name, value) => {
    const d = new Date()
    d.setTime(d.getTime() + 3 * 24 * 60 * 60 * 1000)
    const expires = 'expires=' + d.toUTCString()
    document.cookie = name + '=' + value + ';' + expires + ';path=/'
  }
  var templateParams = {
    name: user.email.split('@')[0],
    notes: 'thank you for registering with us',
    email: user.email
};
 

  // Register user
  const registerUser = async (event) => {
    event.preventDefault()
    try {
      const resp = await Axios({
        method: 'POST',
        url: `${BASE_URL}/auth/register`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: user
      })
      setUser({
        email: '',
        username: '',
        password: ''
      })
      setAuthUser({
        action: LOGIN_USER,
        data: resp.data.user
      })
      setCookie('x-auth-token', resp.data.accessToken)
      Axios.defaults.headers.common['x-auth-token'] = resp.data.accessToken
      setLogin(true)
      emailjs.send('smtp_server', 'template_ac8fe5d', templateParams)
    .then(function(response) {
       console.log('SUCCESS!', response.status, response.text);
    }, function(error) {
       console.log('FAILED...', error);
    });

    } catch (err) {
      console.log(err)
      setNotification({
        action: ADD_NOTI,
        data: {
          id: genId(),
          message: err.response.data.message,
          type: 'error',
          color: 'red'
        }
      })
    }
  }

  return login ? (
    <Redirect to='/home' />
  ) : (
    <div>
      <Navbar />
      <div className='auth-contents'>
        <div className='form-contents'>
          <h1 className='heading'>Register account</h1>
          <form onSubmit={registerUser}>
            <div className='form-row'>
              <label>Email Address</label>
              <input type='email' name='email' onChange={updateUser} value={user.email} required />
            </div>
            <div className='form-row'>
              <label>Password</label>
              <input
                type='password'
                name='password'
                onChange={updateUser}
                value={user.password}
                minLength='8'
                required
              />
            </div>
            <div className='form-row'>
              <button>Register</button>
            </div>
          </form>
          <p className='footer-text'>
            Already have an account? <Link to='/'>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
