export type UnsubscribeFunction = () => void;
export type SubscriberFunction<T> = (eventData: T) => void;

export class Subscribable<EventData = void> {
	private _subs: SubscriberFunction<EventData>[] = [];

	publish(data: EventData): void {
		for (const sub of this._subs) {
			sub(data);
		}
	}

	subscribe(fn: SubscriberFunction<EventData>): UnsubscribeFunction {
		this._subs.push(fn);

		return () => {
			const index = this._subs.indexOf(fn);
			if (index < 0) {
				return;
			}
			this._subs.splice(index, 1);
		};
	}

	removeAllSubscribers(): void {
		this._subs = [];
	}
}
