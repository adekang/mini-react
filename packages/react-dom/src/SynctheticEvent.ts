import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props';
const validEventType = ['click'];

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}

type EventCallback = (e: Event) => void;

interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}

export function updateFiberProps(node: DOMElement, props: Props) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!validEventType.includes(eventType)) {
		if (__DEV__) {
			console.warn('不支持的事件类型', eventType);
		}
		return;
	}
	if (__DEV__) {
		console.warn('初始化事件', eventType);
	}
	container.addEventListener(eventType, (e: Event) => {
		dispatchEvent(container, eventType, e);
	});
}

function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;

	const originStopPropagation = e.stopPropagation;
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};

	return syntheticEvent;
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const targetElement = e.target as DOMElement;

	if (!targetElement) {
		if (__DEV__) {
			console.warn('事件目标不存在', e);
		}
		return;
	}
	// 1. 收集事件
	const { bubble, capture } = collectPaths(targetElement, container, eventType);

	// 2. 构造合成事件
	const syntheticEvent = createSyntheticEvent(e);
	// 3. 遍历  capture 阶段的事件
	triggerEventFlow(capture, syntheticEvent);
	if (!syntheticEvent.__stopPropagation) {
		// 4. 遍历 bubble 阶段的事件
		triggerEventFlow(bubble, syntheticEvent);
	}
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);

		if (se.__stopPropagation) {
			break;
		}
	}
}

function getEventCallbackNameFromEventType(
	eventType: string
): string[] | undefined {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
}

function collectPaths(
	targetElement: DOMElement,
	container: Container,
	eventType: string
) {
	const paths: Paths = { capture: [], bubble: [] };
	while (targetElement && targetElement !== container) {
		// 收集
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			const callBackNameList = getEventCallbackNameFromEventType(eventType);
			if (callBackNameList) {
				callBackNameList.forEach((callBackName, i) => {
					const eventCallBack = elementProps[callBackName];
					if (eventCallBack) {
						if (i === 0) {
							// 事件捕获阶段
							paths.capture.unshift(eventCallBack);
						} else {
							// 事件冒泡阶段
							paths.bubble.push(eventCallBack);
						}
					}
				});
			}
		}

		targetElement = targetElement.parentNode as DOMElement;
	}

	return paths;
}
