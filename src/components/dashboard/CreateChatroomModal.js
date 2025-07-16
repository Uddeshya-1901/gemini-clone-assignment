import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { chatroomSchema } from "../../lib/validations";

const CreateChatroomModal = ({ isOpen, onClose, onCreate }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(chatroomSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = (data) => {
    onCreate(data.title);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Chatroom
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chatroom Name
            </label>
            <Input
              {...register("title")}
              placeholder="Enter chatroom name"
              error={errors.title}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Chatroom
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatroomModal;
