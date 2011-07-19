Ext.define('Extensible.calendar.data.JsonEventStore', {
    extend: 'Ext.data.JsonStore',
    model: 'Extensible.calendar.data.EventModel',
    
    requires: [
        'Extensible.calendar.data.EventModel',
        'Extensible.calendar.data.EventMappings'
    ],
    
  
        autoLoad: true,
    
    // private
    constructor: function(config){
        this.callParent(arguments);
        
        this.sorters = this.sorters || [{
            property: Extensible.calendar.data.EventMappings.StartDate.name,
            direction: 'ASC'
        }];
        
        this.idProperty = this.idProperty || Extensible.calendar.data.EventMappings.EventId.mapping || 'id';
        
        this.fields = Extensible.calendar.data.EventModel.prototype.fields.getRange();
        

        this.autoMsg = config.autoMsg;
        this.onCreateRecords = Ext.Function.createInterceptor(this.onCreateRecords, this.interceptCreateRecords);
    },
    
    // private - override to make sure that any records added in-memory
    // still get a unique PK assigned at the data level
    interceptCreateRecords: function(records, operation, success) {
        console.log(records,operation,success);
        if (success) {
            var i = 0,
                rec,
                len = records.length;
            
            for (; i < len; i++) {
                records[i].data[Extensible.calendar.data.EventMappings.EventId.name] = records[i].id;
            }
        }
    }
    

    
    
});