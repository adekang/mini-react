import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

// wip: work in progress
let wip: FiberNode | null = null;

//  指向需要遍历的第一个fiberNode
function prepareFreshStack(fiber: FiberNode) {
	wip = fiber;
}

function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.error('workLoop发生错误', e);
			wip = null;
		}
	} while (true);
}

function workLoop() {
	while (wip !== null) {
		preformUnitOfWork(wip);
	}
}

function preformUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		wip = next;
	}
}

/**
 * 没有子节点遍历兄弟节点
 * @param fiber
 */
function completeUnitOfWork(fiber: FiberNode) {
	const node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			wip = sibling;
			return;
		}
		node = node.return;
		wip = node;
	} while (node !== null);
}
