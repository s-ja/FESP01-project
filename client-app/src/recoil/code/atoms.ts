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
  parent?: string;
}

export interface CodeListType {
  productCategory: {
    _id: string;
    title: string;
    codes: CategoryCodeType[];
  };
  orderState: {
    _id: string;
    title: string;
    codes: OrderCodeType[];
  };
}

export const codeState = atom<CodeListType | object>({
  key: 'codeState',
  default: {},
  effects: [persistAtom]
});