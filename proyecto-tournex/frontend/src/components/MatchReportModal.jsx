import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function MatchReportModal({ isOpen, onClose, match, isEditMode, onSubmit }) {
  const [reportData, setReportData] = useState({
    winnerId: '',
    score: { participant1Score: 0, participant2Score: 0 },
    notes: ''
  });

  useEffect(() => {
    if (!isOpen || !match) return;

    if (isEditMode && match.winner && match.score) {
      setReportData({
        winnerId: match.winner._id || match.winner,
        score: {
          participant1Score: match.score.participant1Score || 0,
          participant2Score: match.score.participant2Score || 0
        },
        notes: match.notes || ''
      });
    } else {
      setReportData({
        winnerId: '',
        score: { participant1Score: 0, participant2Score: 0 },
        notes: ''
      });
    }
  }, [isOpen, match, isEditMode]);

  if (!match) return null;

  const handleSubmit = () => {
    onSubmit(reportData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Resultado del Match' : 'Reportar Resultado del Match'}
      description={`Ronda ${match.round} - Match #${match.matchNumber}`}
    >
      <div className="space-y-4">
        {/* Seleccionar ganador */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Ganador</label>
          <div className="space-y-2">
            <div
              className={`p-3 border rounded-md cursor-pointer transition ${
                reportData.winnerId === match.participant1._id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setReportData({ ...reportData, winnerId: match.participant1._id })}
            >
              <p className="font-medium">{match.participant1.player?.username}</p>
            </div>
            <div
              className={`p-3 border rounded-md cursor-pointer transition ${
                reportData.winnerId === match.participant2._id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setReportData({ ...reportData, winnerId: match.participant2._id })}
            >
              <p className="font-medium">{match.participant2.player?.username}</p>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Score {match.participant1.player?.username}
            </label>
            <Input
              type="number"
              min="0"
              value={reportData.score.participant1Score}
              onChange={(e) => setReportData({
                ...reportData,
                score: { ...reportData.score, participant1Score: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Score {match.participant2.player?.username}
            </label>
            <Input
              type="number"
              min="0"
              value={reportData.score.participant2Score}
              onChange={(e) => setReportData({
                ...reportData,
                score: { ...reportData.score, participant2Score: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isEditMode ? 'Guardar Cambios' : 'Reportar Resultado'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
