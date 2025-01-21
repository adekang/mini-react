import { Container } from 'hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

/**
 * 创建容器
 * @param container
 * @returns
 */
export function createContainer(container: Container) {
	// 凭空创建一个 HostRoot 类型的 FiberNode 是 dom id=app 的子节点
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	// 给容器与 hostRootFiber 关联
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

/**
 * 更新容器
 * @param element
 * @param root
 * @returns
 */
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;

	// update对象就是接下来要更新的element对象
	const update = createUpdate<ReactElementType | null>(element);

	// 给update赋值
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
