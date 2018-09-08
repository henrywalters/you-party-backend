import IQueryable from '../../DataLayer/Interface/IQueryable';
import ResourcePool from '../../IOLayer/implementation/ResourcePool';
import IResourcePool from '../../IOLayer/interface/IResourcePool';


export default class VideoController {
    private DataSource: IQueryable;
    private ResourcePool: IResourcePool;
}