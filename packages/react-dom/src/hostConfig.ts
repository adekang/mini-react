import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText } from 'react-reconciler/src/workTags';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string, props: any): Instance => {
	// TODO 处理props
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

export const createTxtInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;

export const removeChild = (child: Instance, container: Container) => {
	container.removeChild(child);
};

export function commitUpdate(finishedWork: FiberNode) {
	switch (finishedWork.tag) {
		case HostText:
			const newContent = finishedWork.pendingProps.content;
			return commitTextUpdate(finishedWork.stateNode, newContent);
		default:
			if (__DEV__) {
				console.warn('commitUpdate未支持的类型', finishedWork);
			}
			break;
	}
}

export const commitTextUpdate = (
	textInstance: TextInstance,
	content: string
) => {
	textInstance.nodeValue = content;
};
