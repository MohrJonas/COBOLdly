import { Constant } from "./tokens/Constant";
import { Keyword } from "./tokens/Keyword";
import { Literal } from "./tokens/Literal";
import Token from "./tokens/Token";

export type Link = Keyword | Literal | Constant | Sequence | SplitSequence | Sequence;

export class SplitSequence {

    private set = 0;
    private failed = false;

    constructor(public either: Link, public or: Link) { }

    setEither() {
        this.set = 0;
    }

    setOr() {
        this.set = 1;
    }

    setFailed() {
        this.failed = true;
    }

    getFailed(): boolean {
        return this.failed;
    }

    get(): Link {
        return this.set === 0 ? this.either : this.or;
    }
}


export default class Sequence {

    private links: Array<Link> = [];

    constructor(link: Link) {
        this.then(link);
    }

    validate(tokens: Array<Token>): {
        valid: boolean,
        consumed: number
    } {
        this.links.forEach((link, index) => {
            if(link instanceof SplitSequence) {
                const token = tokens[index].content;
                if(link.either.constructor === token.constructor) {
                    link.setEither();
                }
                else if(link.or.constructor === token.constructor) {
                    link.setOr();
                }
                else {
                    link.setFailed();
                }
            }
        });
        let failed = false;
        let i = 0;
        while (!failed && i < tokens.length && i < this.links.length) {
            const tokenType = tokens[i].content;
            const link = this.links[i];
            //If link is split, check which path work. If none do, fail
            if (link instanceof SplitSequence) {
                if(link.getFailed()) {
                    failed = true;
                }
            }
            //If token and link are of the same class, do nothing
            if (tokenType.constructor !== link.constructor) {
                failed = true;
                break;
            }
            i++;
        }
        return {
            valid: !failed,
            consumed: i
        };
    }

    then(link: Link) {
        this.links.push(link);
    }

    or(either: Link, or: Link) {
        this.then(new SplitSequence(either, or));
    }

}