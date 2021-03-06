/**
 * @class Extensible.calendar.form.EventDetails
 * @extends Ext.form.FormPanel
 * <p>A custom form used for detailed editing of events.</p>
 * <p>This is pretty much a standard form that is simply pre-configured for the options needed by the
 * calendar components. It is also configured to automatically bind records of type {@link Extensible.calendar.data.EventModel}
 * to and from the form.</p>
 * <p>This form also provides custom events specific to the calendar so that other calendar components can be easily
 * notified when an event has been edited via this component.</p>
 * <p>The default configs are as follows:</p><pre><code>
labelWidth: 65,
labelWidthRightCol: 65,
colWidthLeft: .6,
colWidthRight: .4,
title: 'Event Form',
titleTextAdd: 'Add Event',
titleTextEdit: 'Edit Event',
titleLabelText: 'Title',
datesLabelText: 'When',
reminderLabelText: 'Reminder',
notesLabelText: 'Notes',
locationLabelText: 'Location',
webLinkLabelText: 'Web Link',
calendarLabelText: 'Calendar',
repeatsLabelText: 'Repeats',
saveButtonText: 'Save',
deleteButtonText: 'Delete',
cancelButtonText: 'Cancel',
bodyStyle: 'padding:20px 20px 10px;',
border: false,
buttonAlign: 'center',
autoHeight: true // to allow for the notes field to autogrow
</code></pre>
 * @constructor
 * @param {Object} config The config object
 */
Ext.define('Extensible.calendar.form.EventDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.extensible.eventeditform',
    
    requires: [
    'Extensible.form.field.DateRange',
    'Extensible.calendar.form.field.ReminderCombo',
    'Extensible.calendar.data.EventMappings',
    'Extensible.calendar.form.field.CalendarCombo',
    'Extensible.form.recurrence.Combo'
    ],
    
    labelWidth: 65,
    labelWidthRightCol: 65,
    colFlexLeft: 2,
    colFlexRight: 1,
    title: 'Event Form',
    titleTextAdd: 'Add Event',
    titleTextEdit: 'Edit Event',
    titleLabelText: 'Title',
    datesLabelText: 'When',
    reminderLabelText: 'Reminder',
    calendarLabelText: 'Calendar',
    repeatsLabelText: 'Repeats',
    saveButtonText: 'Save',
    deleteButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    bodyStyle: 'padding:20px 20px 10px;',
    border: false,
    buttonAlign: 'center',
    autoHeight: true, // to allow for the notes field to autogrow
    
    /**
     *@cfg array structure 
     *array of strings that rappresent the fields
     *if there is an object it will be copied in the column
     */
    structure:[['titleField','dateRangeField','calendarField','reminderField'],[]],
    
    /* // not currently supported
     * @cfg {Boolean} enableRecurrence
     * True to show the recurrence field, false to hide it (default). Note that recurrence requires
     * something on the server-side that can parse the iCal RRULE format in order to generate the
     * instances of recurring events to display on the calendar, so this field should only be enabled
     * if the server supports it.
     */
    enableRecurrence: false,
    
    // private properties:
    layout: 'hbox',
    
    // private
    initComponent: function(){
        
        if(arguments.structure){
            this.structure=arguments.structure;
        }
        
        this.addEvents({
            /**
             * @event eventadd
             * Fires after a new event is added
             * @param {Extensible.calendar.form.EventDetails} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel record} that was added
             */
            eventadd: true,
            /**
             * @event eventupdate
             * Fires after an existing event is updated
             * @param {Extensible.calendar.form.EventDetails} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel record} that was updated
             */
            eventupdate: true,
            /**
             * @event eventdelete
             * Fires after an event is deleted
             * @param {Extensible.calendar.form.EventDetails} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel record} that was deleted
             */
            eventdelete: true,
            /**
             * @event eventcancel
             * Fires after an event add/edit operation is canceled by the user and no store update took place
             * @param {Extensible.calendar.form.EventDetails} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel record} that was canceled
             */
            eventcancel: true
        });
                
        this.titleField = Ext.create('Ext.form.TextField', {
            fieldLabel: this.titleLabelText,
            name: Extensible.calendar.data.EventMappings.Title.name,
            anchor: '90%'
        });
        this.dateRangeField = Ext.create('Extensible.form.field.DateRange', {
            fieldLabel: this.datesLabelText,
            singleLine: false,
            anchor: '90%',
            listeners: {
                'change': Ext.bind(this.onDateChange, this)
            }
        });
        this.reminderField = Ext.create('Extensible.calendar.form.field.ReminderCombo', {
            name: Extensible.calendar.data.EventMappings.Reminder.name,
            fieldLabel: this.reminderLabelText,
            anchor: '70%'
        });
        //        this.urlField = Ext.create('Ext.form.TextField', {
        //            fieldLabel: this.webLinkLabelText,
        //            name: Extensible.calendar.data.EventMappings.Url.name,
        //            anchor: '100%'
        //        });
        
        //        var leftFields = [this.titleField, this.dateRangeField, this.reminderField], 
        //            rightFields = [this.urlField];
            
        if(this.enableRecurrence){
            this.recurrenceField = Ext.create('Extensible.form.recurrence.Fieldset', {
                name: Extensible.calendar.data.EventMappings.RRule.name,
                fieldLabel: this.repeatsLabelText,
                anchor: '90%'
            });
        //            leftFields.splice(2, 0, this.recurrenceField);
        }
        
        if(this.calendarStore){
            this.calendarField = Ext.create('Extensible.calendar.form.field.CalendarCombo', {
                store: this.calendarStore,
                fieldLabel: this.calendarLabelText,
                name: Extensible.calendar.data.EventMappings.CalendarId.name,
                anchor: '70%'
            });
        //            leftFields.splice(2, 0, this.calendarField);
        }
        
        
        //changes for dynamic structure
        var leftStructure=this.structure[0],rightStructure=this.structure[1];
        
        for(x=0;x<leftStructure.length;x++){
            if(typeof leftStructure[x]=="string" && this[leftStructure[x]]){
                leftStructure[x]=this[leftStructure[x]];
            }
        }
        
        for(x=0;x<rightStructure.length;x++){
            if(typeof rightStructure[x]=="string" && this[rightStructure[x]]){
                rightStructure[x]=this[rightStructure[x]];
            }
        }
        
        //end changes
        
        
        this.items = [{
            xtype:'container',
            align: 'stretch',
            id: this.id+'-left-col',
            flex:this.colFlexLeft,
            layout: 'anchor',
            fieldDefaults: {
                labelWidth: this.labelWidth
            },
            border: false,
            items: leftStructure
        },{
            xtype:'container',
            align: 'stretch',
            id: this.id+'-right-col',
            flex:this.colFlexRight,
            layout: 'anchor',
            fieldDefaults: {
                labelWidth: this.labelWidthRightCol || this.labelWidth
            },
            border: false,
            items: rightStructure
        }];
        
        this.fbar = [{
            text:this.saveButtonText, 
            scope: this, 
            handler: this.onSave
        },{
            itemId:this.id+'-del-btn', 
            text:this.deleteButtonText, 
            scope:this, 
            handler:this.onDelete
        },{
            text:this.cancelButtonText, 
            scope: this, 
            handler: this.onCancel
        }];
        
        this.addCls('ext-evt-edit-form');
        
        this.callParent(arguments);
    },
    
    // private
    onDateChange: function(dateRangeField, val){
        if(this.recurrenceField){
            this.recurrenceField.setStartDate(val[0]);
        }
    },
    
    // inherited docs
    loadRecord: function(rec){
        this.form.reset().loadRecord.apply(this.form, arguments);
        this.activeRecord = rec;
        this.dateRangeField.setValue(rec.data);
        
        if(this.recurrenceField){
            this.recurrenceField.setStartDate(rec.data[Extensible.calendar.data.EventMappings.StartDate.name]);
        }
        if(this.calendarStore){
            this.form.setValues({
                'calendar': rec.data[Extensible.calendar.data.EventMappings.CalendarId.name]
            });
        }
        
        //this.isAdd = !!rec.data[Extensible.calendar.data.EventMappings.IsNew.name];
        if(rec.phantom){
            this.setTitle(this.titleTextAdd);
            this.down('#' + this.id + '-del-btn').hide();
        }
        else {
            this.setTitle(this.titleTextEdit);
            this.down('#' + this.id + '-del-btn').show();
        }
        this.titleField.focus();
    },
    
    // inherited docs
    updateRecord: function(){

        var record = this.activeRecord,
        fields = this.activeRecord.fields,
        values = this.getForm().getFieldValues(),
        
        dates = this.dateRangeField.getValue(),
        M = Extensible.calendar.data.EventMappings,
        name,
        obj = {},
        dirty = false;

        fields.each(function(f) {
            name = f.name;
            if (name in values) {
                obj[name] = values[name];
            }
        });
        
        record.beginEdit();
        record.set(obj);
        
//        console.log(obj,record);
       
        record.set(M.StartDate.name, dates[0]);
        record.set(M.EndDate.name, dates[1]);
        record.set(M.IsAllDay.name, dates[2]);
        
        dirty = rec.dirty;
        //delete rec.store; // make sure the record does not try to autosave
        record.endEdit();
        return dirty;
    },
    
    // private
    onCancel: function(){
        this.cleanup(true);
        this.fireEvent('eventcancel', this, this.activeRecord);
    },
    
    // private
    cleanup: function(hide){
        if(this.activeRecord){
            this.activeRecord.reject();
        }
        delete this.activeRecord;
        
        if(this.form.isDirty()){
            this.form.reset();
        }
    },
    
    // private
    onSave: function(){
        if(!this.form.isValid()){
            return;
        }
        if(!this.updateRecord()){
            this.onCancel();
            return;
        }
//        console.log('mi sono aggiornato');
        this.fireEvent(this.activeRecord.phantom ? 'eventadd' : 'eventupdate', this, this.activeRecord);
    },
    

    // private
    onDelete: function(){
        this.fireEvent('eventdelete', this, this.activeRecord);
    }
});