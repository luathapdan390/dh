import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: "text" | "date" | "time" | "textarea";
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}) => {
  const baseClasses =
    "w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-400";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
};

export default InputField;
