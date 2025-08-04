import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Supprimer mon compte
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Cette action est irréversible
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer votre compte ? Cette action va :
          </p>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Désactiver votre profil immédiatement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Vous empêcher de vous reconnecter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Supprimer l'accès à vos données et conversations</span>
            </li>
          </ul>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">
              ⚠️ Cette action ne peut pas être annulée
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer mon compte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog; 