import {CompositeDecorator} from "draft-js";
import {findImageEntities} from "./strategy.js";
import {Image} from "./component.js";

export const ImageDecorator = new CompositeDecorator([
    {
        strategy: findImageEntities,
        component: Image
    }
]);