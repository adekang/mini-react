import { Action } from 'shared/ReactTypes';
import { Container } from 'hostConfig';
import { FiberNode } from './fiber';

export interface Update<State> {
	// 接受setState 传的值 或者()=>{}函数
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

/**
 * 创建一个更新 创建update实例
 * @param action 传入的值 或者函数
 * @returns 返回一个更新
 */
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

/**
 * 创建一个更新队列
 * @returns  返回一个更新队列
 */
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

/**
 * 向队列中添加更新 向updateQueue 里面增加一个update
 * @param updateQueue 要更新的队列
 * @param update 更新值
 */
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

/**
 * UpdateQueue消费update  计算状态的最新值
 * @param baseState 初始状态
 * @param pendingUpdate 待消费的update
 * @return 返回一个新的状态 memoizedState
 */
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		// action 传的是函数 还是值
		if (action instanceof Function) {
			// baseState 1 update (x)=>2*x -> memoizedState 2
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2 -> memoizedState 2
			result.memoizedState = action;
		}
	}

	return result;
};
