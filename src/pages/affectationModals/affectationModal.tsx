import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AffectationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  users: any[];
  assignments: any[];
  createAffectation: (taskId: string, userId: string, mode: string) => void;
  runAI: (taskId: string) => Promise<any>;
}

const AffectationModal: React.FC<AffectationModalProps> = ({
  isOpen,
  onClose,
  task,
  users,
  assignments,
  createAffectation,
  runAI,
}) => {
  const [mode, setMode] = useState<"manuel" | "semi-auto" | "auto" | null>(null);
  const [aiReport, setAiReport] = useState<any>(null);

  if (!isOpen || !task) return null;

  const placesTotales = task.nombrePlaces ?? 0;

  const dejaAffectees = assignments.filter(a => a.task === task._id).length;

  const placesRestantes = Math.max(placesTotales - dejaAffectees, 0);

  
  const canAssign = placesRestantes > 0;

  
  const semiAutoList = users
    .filter(u => (task.specialites ?? []).includes(u.specialite))
    .slice(0, placesRestantes);

  
  const handleAuto = async () => {
    const report = await runAI(task._id);
    setAiReport(report);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-body rounded-xl p-5 w-[600px] relative shadow-lg">
        
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Affectation – {task.titre}
        </h2>

        <p className="text-sm mb-2">
          Places totales : <b>{placesTotales}</b> — Déjà affectées : <b>{dejaAffectees}</b> — Restantes : <b>{placesRestantes}</b>
        </p>

        {!canAssign && (
          <p className="text-red-600 font-medium">
            Toutes les places pour cette tâche sont déjà affectées.
          </p>
        )}

        {canAssign && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                className={`px-3 py-1 rounded ${mode === "manuel" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => setMode("manuel")}
              >
                Manuel
              </button>
              <button
                className={`px-3 py-1 rounded ${mode === "semi-auto" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => setMode("semi-auto")}
              >
                Semi-auto
              </button>
              <button
                className={`px-3 py-1 rounded ${mode === "auto" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => {
                  setMode("auto");
                  handleAuto();
                }}
              >
                Auto (IA)
              </button>
            </div>

            {/* Manuel */}
            {mode === "manuel" && (
              <div>
                {users.map(u => (
                  <div key={u._id} className="flex justify-between p-3 border rounded mb-2">
                    <div>
                      {u.firstName} {u.lastName} — {u.specialite}
                    </div>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => createAffectation(task._id, u._id, "manuel")}
                    >
                      Affecter
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Semi-auto */}
            {mode === "semi-auto" && (
              <div>
                {semiAutoList.length === 0 && (
                  <p>Aucun candidat disponible selon la spécialité.</p>
                )}

                {semiAutoList.map(u => (
                  <div key={u._id} className="flex justify-between p-3 border rounded mb-2">
                    <div>
                      {u.firstName} {u.lastName} — {u.specialite}
                    </div>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => createAffectation(task._id, u._id, "semi-auto")}
                    >
                      Affecter
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Auto IA */}
            {mode === "auto" && (
              <div>
                {!aiReport && <p>Analyse IA en cours…</p>}

                {aiReport && (aiReport.recommendations ?? []).length === 0 && (
                  <p>Aucune recommandation IA disponible.</p>
                )}

                {(aiReport?.recommendations ?? [])
                  .slice(0, placesRestantes)
                  .map((rec: any, idx: number) => {
                    const u = users.find(x => x._id === rec.userId);
                    if (!u) return null;

                    return (
                      <div key={idx} className="flex justify-between p-3 border rounded mb-2">
                        <div>
                          {u.firstName} {u.lastName} — Score IA : {rec.score}
                        </div>
                        <button
                          className="bg-green-700 text-white px-3 py-1 rounded"
                          onClick={() => createAffectation(task._id, u._id, "auto")}
                        >
                          Affecter
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AffectationModal;
