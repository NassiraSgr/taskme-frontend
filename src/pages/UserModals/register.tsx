import { SyntheticEvent, useState } from "react";
import { Navigate } from "react-router-dom";


const Register = () => {

    const [firstName, setfirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("AUDITEUR");
    const [specialite, setSpecialite] = useState("");
    const [grade, setGrade] = useState("");
    const [diplomes, setDiplomes] = useState('')
    const [formations, setFormations] = useState('')
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('')
    
    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        const diplomesArray = diplomes
          .split("\n")
          .map(d => d.trim())
          .filter(d => d !== ""); //pour supprimer les lignes vides

        const formationsArray = formations
          .split("\n")
          .map(f => f.trim())
          .filter(f => f !== "");
        // console.log(firstName, email, password);
        const response = await fetch('https://taskme-backend-wt4m.onrender.com/api/register',{
          method:'POST',
          headers:{'Content-Type' : 'application/json'}, 
          body : JSON.stringify({
            firstName, lastName, email, role, specialite, grade, diplomes:diplomesArray, formations:formationsArray, password
          })
        })
        const content = await response.json();
        
        if(content.message === "error creating user"){
          setError('erreur lors de creation de utilisateur !')
          console.log('res 1  :',content);
          return
        }
        console.log('res : ',content.message);
        setRedirect(true);
        
    }
    if(redirect){
      return <Navigate to ="/login"/>
    }


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "450px" }}>
        <h3 className="text-center mb-4">Create Account</h3>
        
        <form onSubmit={submit}>
        
          <div className="mb-3">
            <label className="form-label fw-semibold">first Name</label>
            <input
              className="form-control"
              value={firstName}
              onChange={(e) => setfirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Last Name</label>
            <input
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          
          <div className="mb-3">
            <label className="form-label fw-semibold">Role</label>
            <select
              className="form-select"
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Auditeur">Auditeur</option>
              <option value="COORDINATEUR">Coordinateur</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          
          {(role ==='AUDITEUR' ) && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Spécialité</label>
              <select
                className="form-select"
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
               
              >
                <option value="">-- choisir --</option>
                <option value="PEDAGOGIQUE">Pédagogique</option>
                <option value="ORIENTATION">Orientation</option>
                <option value="PLANIFICATION">Planification</option>
                <option value="FINANCIER">Services financiers</option>
              </select>
            </div>
          )}

          
          {role === "AUDITEUR" && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Grade</label>
              <select
                className="form-select"
                onChange={(e) => setGrade(e.target.value)}
            
              >
                <option value="">-- choisir --</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
          )}
          {role==='AUDITEUR' && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Diplômes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Un diplôme par ligne"
                onChange={(e) => setDiplomes(e.target.value)}
              />
          </div>
          )}
          
          {role==='AUDITEUR' && (
            <div className="mb-3">
                <label className="form-label fw-semibold">Formations</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Une formation par ligne"
                  onChange={(e) => setFormations(e.target.value)}
                />
          </div>)}
          


          <button className="btn btn-primary w-100 mt-3">
            Register
          </button>
          {error &&  ( <div> <hr /> <div className="text-danger">{error}</div> </div>) } 
          <p className="text-center text-muted small mt-4 mb-0">
            &copy; taskme 2025-2026
          </p>
        </form>
      </div>
    </div>
);

}

export default Register;