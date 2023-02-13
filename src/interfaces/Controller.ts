import { Route } from './Route';
import { Service } from './Service';

export interface Controller {
  service: Service;
  routes: Route[];
}
