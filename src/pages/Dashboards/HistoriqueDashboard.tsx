import React, { useEffect, useState } from "react";


const HistoriqueDashboard = ({ user }: { user: any }) => {
  const [historique, setHistorique] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [length, setLength] = useState<Number>(0)
  const [message, setMessage] = useState<String>('')


  const handleDelete = async () => {
    const res = await fetch('http://localhost:3000/api/historique/delete-all', {
      method:'DELETE',
      headers:{'Content-Type' : 'application/json'},
      credentials:'include'
    })
    console.log(res);
    
    if(!res.ok){ 
      setMessage('Une erreur se produit lors de suppression')
      return
    }
    const data = await res.json()
    console.log(data);
    setHistorique([])
    
    
  }
  const fetchHistorique = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/historique", {
        method:'GET',
        credentials: "include",
        headers:{'Content-Type' : 'application/json'}
      });
      if (!res.ok) throw new Error("Impossible de récupérer l'historique");
      const data = await res.json();
      console.log(data);
      
      setHistorique(data);
    } catch (err) {
      console.error(err);
      setHistorique([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistorique();
    const interval = setInterval(fetchHistorique, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container py-4">
      <h2>Historique des actions</h2>
      {loading ? <p>Chargement...</p> : null}
      {historique.length > 0 ? (
        <button
          onClick={handleDelete}
          style={{
            padding: "10px 18px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "20px",
            fontWeight: 500,
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
        >
          Supprimer l'historique
        </button>
      ) : (
        <div style={{ marginBottom: "20px", color: "#6c757d", fontStyle: "italic" }}>
          Historique vide
        </div>
      )}

      
      <ul className="list-group">
        {historique.map((h) => (
          <li key={h._id} className="list-group-item">
            <strong>{h.acteur?.firstName} {h.acteur?.lastName},</strong>{" "}
            vous avez effectué <em>{h.type}</em>{" "}
            {h.taskId ? `sur la tâche "${h.taskId.nom}"` : ""}
            {h.cible ? ` → ${h.cible.firstName} ${h.cible.lastName}` : ""}
            <br />
            <small className="text-muted">{new Date(h.date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoriqueDashboard;
