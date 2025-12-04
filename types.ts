// types.ts
import React from 'react';

export interface DetailItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// --- ДОБАВЛЕННЫЕ ТИПЫ ---
export type Option = { label: string; price: number; value: string };
export type ConfigCategory = { id: string; name: string; options: Option[] };
// --- КОНЕЦ ДОБАВЛЕНИЙ ---

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
      group: any;
      primitive: any;
      mesh: any;
      boxGeometry: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
    }
  }
}