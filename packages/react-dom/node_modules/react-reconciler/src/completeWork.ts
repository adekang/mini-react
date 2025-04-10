import {
	appendInitialChild,
	Container,
	createInstance,
	createTxtInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags, Update } from './fiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

function markUpdate(fiber: FiberNode) {
	// 标记更新
	fiber.flags |= Update;
}

/**
 * 递归中的归阶段
 */
export function completeWork(wip: FiberNode) {
	console.log('completeWork', wip);

	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			// 无需处理
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				// 1.构建DOM;
				const instance = createInstance(wip.type, newProps);
				// 2.将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			// 无需处理
			bubbleProperties(wip);
			return null;
		case HostText:
			// 无需处理
			if (current !== null && wip.stateNode) {
				// update
				const oldText = current.memoizedProps.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				// mount
				// 1.构建DOM;
				const instance = createTxtInstance(newProps.content);
				// 2.将DOM插入到DOM树中
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			// 无需处理
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('completeWork: 未知的tag类型', wip);
			}
			break;
	}

	return null;
}

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			// 递归处理子节点
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 先处理子节点
			node.child.return = node;
			// 递归处理子节点
			node = node.child;
			continue;
		}
		if (node === wip) {
			return;
		}

		// 处理兄弟节点
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			// 回溯到父节点
			node = node?.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// 收集更新 flags，将子 FiberNode 的 flags 冒泡到父 FiberNode 上
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subtreeFlags |= subtreeFlags;
}
