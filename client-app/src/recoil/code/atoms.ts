import { atom } from 'recoil';
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: 'code',
  storage: localStorage,
});

export interface OrderCodeType {
  code: string;
  value: string;
  sort: number;
}

export interface CategoryCodeType extends OrderCodeType{
  depth: number;
  sub?: CategoryCodeType[];
}

export interface CodeType {
  _id: string;
  title: string;
  codes: CategoryCodeType[];
  depth?: number;
  nestedCodes?: CategoryCodeType[];
}

export interface CodeListType {
  [code: string]: CodeType;
}

export const codeState = atom<CodeListType>({
  key: 'codeState',
  default: {},
  effects: [persistAtom]
});