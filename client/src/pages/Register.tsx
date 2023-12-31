import { useState } from "react"; 
import "../styles/Register.css"; 
import { RegisterProps } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore"; 
import { setDefaultAvatar } from "../utils";

export default function Register() {
  // UserAuth 
  const { signUpWithEmailAndPassword } = UserAuth(); 

  // useNavigate
  const navigate = useNavigate(); 

  // useState
  const [formData, setFormData] = useState<RegisterProps>({
    displayName: "", 
    email: "", 
    password: "", 
    avatar: setDefaultAvatar(), 
  }); 

  // destructure all elements from formData 
  const { displayName, email, password, avatar } = formData; 

  // handleChange 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev, 
      [e.target.name]: e.target.value, 
    })); 
  };

  // handleSignUpWithEmailAndPassword
  const handleSignUpWithEmailAndPassword = async (email: string, password: string, displayName: string, avatar: string) => {
    try {
      const userCredential = await signUpWithEmailAndPassword(email, password); 
      // setUser(...) throws error, fixing with following line
      await updateProfile(userCredential.user, {
        displayName: displayName, 
        photoURL: avatar, 
      }); 
      
      // add user's credential into firebase firestore db 
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid, 
        displayName, 
        email,
        photoURL: avatar, 
      }); 

      // add userChats into firestore db 
      await setDoc(doc(db, "userChats", userCredential.user.uid), {}); 
    } catch(error) {
      console.log(error); 
    }
  };

  // handleSubmit 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    await handleSignUpWithEmailAndPassword(email, password, displayName, avatar); 
    navigate("/"); 
  };

  return (
    <div className="register">
      <div className="register__wrapper">
        <form className="register__form" onSubmit={handleSubmit} data-testid="form">
          <h2>warbler</h2>
          <label htmlFor="displayName">Display Name</label>
          <input 
            type="text"
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={handleChange} 
            placeholder="John Doe"
          />
          <label htmlFor="email">Email</label>
          <input 
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={handleChange} 
            placeholder="jdoe@test.com"
          />
          <label htmlFor="password">Password</label>
          <input 
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange} 
            placeholder="**********"
            autoComplete="on"
          />
          <input 
            className="avatar__input"
            style={{ display: "none" }}
            type="file"
            id="file"
            name="avatar"
            onChange={(e) => e.target.files?.[0]}
          />
          <button>Register</button>
          <p>already have an account?<Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  )
}