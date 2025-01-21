import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ReactElementType } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { Placement } from './fiberFlags';
import { HostText } from './workTags';

/**
 * 用于处理子节点的协调器
 * @param shouldTrackSideEffects  是否追踪副作用
 */
function childReconciler(shouldTrackSideEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 根据element创建fiber
		// 在这里给子节点挂在return 和 父fiber进行关联的
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		// 返回的是新子元素创建的fiber对象
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	/**
	 * 插入单一的节点
	 * @param fiber
	 */
	function placeSingleChild(fiber: FiberNode) {
		// fiber是wip的fiber  这是一个首屏渲染的过程
		// 首屏渲染且追踪副作用时，才添加更新 flags
		if (shouldTrackSideEffects && fiber.alternate === null) {
			// TODO
			fiber.flags |= Placement;
		}
		return fiber;
	}

	/**
	 * 协调子节点
	 * @param returnFiber returnFiber 就是 wip
	 * @param currentFiber  currentFiber 是 hostRootFiber.child
	 * @param newChild newChild 是 App 组件
	 */
	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		// 判断当前fiber的类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						// 用新element创建新fiber, return 执行父级fiber
						// 返回子元素fiber对象
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn(
							'reconcileChildFibers: 未知的ReactElementType',
							newChild
						);
					}
					break;
			}
		}

		// TODO 多节点的情况 ul>li*3
		// 多个 Fragment 节点
		if (Array.isArray(newChild)) {
			// TODO: 暂时不处理
			if (__DEV__) {
				console.warn('未实现的 reconcile 类型', newChild);
			}
		}

		//  HOST_TEXT 文本节点的情况
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (__DEV__) {
			console.warn('reconcileChildFibers: 未知的ReactElementType', newChild);
		}

		return null;
	};
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
