import {CompositeDecorator} from "draft-js";
import {findLinkEntities} from "./strategy.js";
import {Link} from "./component.js";

export const LinkDecorator = new CompositeDecorator([
    {
        strategy: findLinkEntities,
        component: Link
    }
]);