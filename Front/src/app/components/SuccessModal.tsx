import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center justify-center p-6">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <p className="text-lg text-gray-700 text-center mb-6">{message}</p>
        <Button onClick={onClose} className="px-6 py-2 bg-green-600 hover:bg-green-700">
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
