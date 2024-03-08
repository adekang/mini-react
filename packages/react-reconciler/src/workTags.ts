export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0; // 函数组件
export const HostRoot = 3; // 根节点类型
export const HostComponent = 5; // 原生节点
export const HostText = 6; // 文本节点
