import React from 'react';
import './AvatarPicker.css';

const PRESETS = [
  '🐶','🐱','🐼','🦊','🐻','🐨','🐯','🐸','🦁','🐵',
  '🐤','🦉','🦄','🐙','🐳','🐧','🐰','🐹','🐝','🐮'
];

export default function AvatarPicker({ value, onChange }) {
  return (
    <div className="avatar-picker">
      {PRESETS.map((a) => (
        <button
          type="button"
          key={a}
          className={`avatar-btn ${value === a ? 'active' : ''}`}
          onClick={() => onChange(a)}
          title={`選擇 ${a}`}
        >
          <span>{a}</span>
        </button>
      ))}
    </div>
  );
}
