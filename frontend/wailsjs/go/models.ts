export namespace main {
	
	export class FileSizeInfo {
	    path: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new FileSizeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.size = source["size"];
	    }
	}

}

