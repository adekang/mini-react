import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Props,
	ReactElementType,
	Ref,
	ElementType
} from 'shared/ReactTypes';

/**
 * ReactElement 构造函数
 * @param type element type
 * @param props 组件的属性
 * @param key 组件的key
 * @param ref 组件的ref
 * @returns
 */
const ReactElement = (
	type: Type,
	props: Props,
	key: Key,
	ref: Ref
): ReactElementType => {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE, // 标识这是一个react元素
		type,
		props,
		key,
		ref,
		__mark: 'adekang'
	};

	return element;
};
/**
 * jsx 函数
 * @param type 接受组件的type
 * @param config 接受组件的配置
 * @param maybeChildren 接受组件的子元素(可能不传)
 * @returns
 */
export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	//  遍历config对象，将key和ref属性单独处理，其他属性放到props对象中
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		// 其他自己的属性放到props对象中，而不是原型链上的属性
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	// props.children  可能是一个元素，也可能是多个元素
	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			// 只有一个子元素的时候，直接将子元素放到props对象中
			props.children = maybeChildren[0];
		} else if (maybeChildrenLength > 1) {
			// 有多个子元素的时候，将子元素放到props对象中
			props.children = maybeChildren;
		}
	}

	return ReactElement(type, props, key, ref);
};

// jsxDEV
export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	//  遍历config对象，将key和ref属性单独处理，其他属性放到props对象中
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		// 其他自己的属性放到props对象中，而不是原型链上的属性
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}
	return ReactElement(type, props, key, ref);
};
