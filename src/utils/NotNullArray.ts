export default class NotNullArray<T> {

	private array: Array<T> = [];

	/**
    * An array that ignores the insertion of undefined values
    */
	constructor(...elements: Array<T | undefined>) {
		elements.forEach((element) => { if (element) { this.array.push(element); } });
	}

	push(t: T | undefined) {
		if (t) { this.array.push(t); }
	}

	asArray(): Array<T> {
		return this.array;
	}

}