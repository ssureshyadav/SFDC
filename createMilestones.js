import { LightningElement,track,api,wire } from 'lwc';
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import Milestone from '@salesforce/schema/Milestone__c';
import { getRecord } from 'lightning/uiRecordApi';
import userId from '@salesforce/user/Id';
import PRO_NAME_FIELD from '@salesforce/schema/User.Profile.Name';
//import Stage from '@salesforce/schema/Milestone__c.Stage__c';
import Milestonepicklist from '@salesforce/schema/Milestone__c.Milestone__c';
import SIPObjective from '@salesforce/schema/Milestone__c.SIP_Objective_Owned_by_BM__c';
import SIPReq from '@salesforce/schema/Milestone__c.SIP_REQ__c';
import MilestoneStatus from '@salesforce/schema/Milestone__c.Milestone_Status__c';
import PrimaryReason from '@salesforce/schema/Milestone__c.Primary_Reason__c';
import Reason from '@salesforce/schema/Milestone__c.Reason__c';
import Proof from '@salesforce/schema/Milestone__c.Proof__c';
import id from '@salesforce/user/Id';
//import objectsList from '@salesforce/apex/SOOLWCEdit.loadtambaIds';

export default class CreateMilestones extends LightningElement {

    @api milestone;
    @api selectedvalue;
    @api tambarecords;
    @api maptamba;
    @api type;
    @api rdmilestonecount;
    @api prodmilestonecount;
    @api lstrdtargetmilestone;
    @api lstprodtargetmilestone;
    @api lstlitetargetmilestone;
    @api hasStatusAccess;
    @api hasaccess;
    @api hasdeleteaccess;
    @api hasMidyearSIPREQReadAccess;
    @api hasReasonReadAccess;
    @api hasCommentsJustificationsReadAccess;

    @api hasMidyearSIPREQEditAccess;
    @api hasReasonEditAccess;
    @api hasCommentsJustificationsEditAccess;

    @track isRd=false;
    @track isProd=false;
    @track tambaArray;
    @track displayreason=false;
    @track displayproof=false;
    @track hasError =false;
    @track errorMessage ='';
    @track disableSIP =false;
    @track checkSIPObjectiveValue=false;
    @track displayReasonComments=false;
    @track displayCommentsJustification=false;
    @api subtype = '';
    @api prioritytamba='';

    onSuccessfulldemo = false;
    sipReqvalue = '--None--';
    sipObjectivetrue = true;
    profileName ='';


    @wire(getRecord, {recordId: userId,fields: [PRO_NAME_FIELD]}) 
        wireuser({error,data}) {
        if (error) {
           this.error = error ; 
        } else if (data) {
           console.log('profile name--->'+JSON.stringify(data.fields.Profile.displayValue));
           this.profileName = data.fields.Profile.displayValue;
           if(data.fields.Profile.displayValue == 'System Administrator' || data.fields.Profile.displayValue == 'Sales Ops SFDC Admins'){
                        this.sipObjectivetrue = false;
                    }
        }
    }

    @track localmilestone = {
        TAMBA_Name__c :'',
        Name: '',
        Application_Name__c : '',
        Customer_Engagement1__c :'',
        Milestone__c :'',
        Target_Date__c:'',
        SIP_Objective_Owned_by_BM__c:'',
        Milestone_Status__c:'',
        Prioritized_TAMBA_FYs__c :'',
        Additional_Information__c : '',
        Primary_Reason__c:'',
        Proof__c:'',
        Comments_Justifications__c:'',
        Reason__c:'',
        Mid_year_SIP_REQ__c:false,
        Id :'',
        No_Application_Target_Milestone__c : '',
    }//Stage__c : '',

    @api
    get sipObjectiveEnabled(){
        return ((this.localmilestone.Milestone__c == 'Successful Demo' || !this.hasaccess) || this.disableSIP || this.localmilestone.Mid_year_SIP_REQ__c)?true:false;
    }

    @api
    get checkstatusAccess(){
        return (this.hasStatusAccess || !this.hasaccess)?true:false;
    }

    @api
    get MidyearSIPREQReadAccess(){
        return (!this.hasMidyearSIPREQEditAccess);
    }

    @api
    get ReasonReadAccess(){
        return (!this.hasReasonEditAccess);
    }

    @api
    get isLite(){
        return this.subtype =='Lite';
    }

    @api
    get CommentsJustificationsReadAccess(){
        return (!this.hasCommentsJustificationsEditAccess);
    }

    @api
    get checkAccess(){
        return (!this.hasaccess)?true:false;
    }

    @api
    get hasRecordId(){
        return this.localmilestone.Id != ''?true:false;
    }

    @api
    get hasDeleteAccess(){
        const status=this.localmilestone.Milestone_Status__c;
        if(this.localmilestone.SIP_Objective_Owned_by_BM__c == "FY22 SIP Approved"){
            if(this.hasdeleteaccess){
                return false;
            }
           // return false;
        }
        if(this.localmilestone.Id != '' && (status == 'Achieved' || status =='Not Achieved – but continue to engage' || status =='Lost – no longer engaging' || status =='Forfeit - BU decided not to pursue' || status =='Gone – Application no longer in the flow')){
            console.log('Delete Access::'+this.hasdeleteaccess);
            console.log(status);
            console.log(this.localmilestone.Id);
            if(this.hasdeleteaccess){
                return false;
            }
           // return false;
        }
        // else if(this.hasdeleteaccess){
        //     return true;
        // }
        return this.hasdeleteaccess;
    }

    @api 
    get fetchApplication(){
        if(this.localmilestone.TAMBA_Name__c != '' && this.localmilestone.TAMBA_Name__c != undefined && this.maptamba[this.localmilestone.TAMBA_Name__c] != null){
            var applicationNameCustomer=this.maptamba[this.localmilestone.TAMBA_Name__c].Application_Name_Customer__c;
            return ((applicationNameCustomer =='' || applicationNameCustomer == undefined) ?'':this.maptamba[this.localmilestone.TAMBA_Name__c].Application_Name_Customer__r.Name);
        }
        return '';
    }

    @api 
    get fetchcustomerEngagement(){
        if(this.localmilestone.TAMBA_Name__c != '' && this.localmilestone.TAMBA_Name__c != undefined && this.maptamba[this.localmilestone.TAMBA_Name__c] != null){
            return this.maptamba[this.localmilestone.TAMBA_Name__c].Customer_Engagement__c ;
        }
        return '';
    }

    @api 
    get fetchDtor(){
        if(this.localmilestone.TAMBA_Name__c != '' && this.localmilestone.TAMBA_Name__c != undefined && this.maptamba[this.localmilestone.TAMBA_Name__c] != null){
            return this.maptamba[this.localmilestone.TAMBA_Name__c].DTOR_Date__c;
        }
        return '';
    }

    @api 
    get fetchPtor(){
        if(this.localmilestone.TAMBA_Name__c != '' && this.localmilestone.TAMBA_Name__c != undefined && this.maptamba[this.localmilestone.TAMBA_Name__c] != null){
            return this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
        }
        return '';
    }
    
@track noTamba = false;
    connectedCallback(){
        if(this.prioritytamba == 'No TAMBA'){
            this.noTamba = true;
        }
        this.localmilestone = {...this.milestone};
        console.log(JSON.stringify(this.localmilestone));
        console.log('hasCommentsJustificationsEditAccess::'+this.hasCommentsJustificationsEditAccess);

        
        if(this.localmilestone.SIP_REQ__c == 'FY23 MDYR REQ' && (this.hasReasonEditAccess || this.hasReasonReadAccess)){
            this.displayReasonComments=true;
            //this.localmilestone.Reason__c = 'New P-TAMBA';
            if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                this.displayCommentsJustification=true;
            }
        }
        this.checkSIPObjectiveValue=(this.localmilestone.Mid_year_SIP_REQ__c && (this.hasMidyearSIPREQEditAccess || this.hasMidyearSIPREQReadAccess));
        console.log(' this.checkSIPObjectiveValue-->'+ this.checkSIPObjectiveValue);
        if((this.localmilestone.SIP_Objective_Owned_by_BM__c == '' || this.localmilestone.SIP_Objective_Owned_by_BM__c == undefined) &&  (this.hasMidyearSIPREQEditAccess || this.hasMidyearSIPREQReadAccess) ){
            this.checkSIPObjectiveValue =true;
            console.log(' this.checkSIPObjectiveValue1-->'+ this.checkSIPObjectiveValue);
        }
        if(this.localmilestone.Milestone_Status__c == 'On Schedule' || this.localmilestone.Milestone_Status__c == 'Behind / At risk' || this.localmilestone.Milestone_Status__c == 'Not Achieved - but continue to engage'){
            this.checkSIPObjectiveValue =true;
        }
        if(this.checkSIPObjectiveValue){
            const deleteEvent = new CustomEvent("showchecksip", {
                detail : true
            });
            this.dispatchEvent(deleteEvent);
        }
        if(this.localmilestone.SIP_Objective_Owned_by_BM__c != '' && 
            this.localmilestone.SIP_Objective_Owned_by_BM__c != null ){
                this.disableSIP =true;
        }

        if(this.type === 'RD'){
            this.isRd =true;
            //this.milepicklist = this.addValuesToArray(this.milestone.Milestone__c,Object.values(this.lstrdtargetmilestone));
            var targetMilestone=this.milestone.Milestone__c;
            if(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR'){
                if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                    this.displayCommentsJustification =true;
                }
                
            }
            const arrayValue=[];
            const arrayValue1=[];
            if(this.milestone.Milestone__c !== ''){
                arrayValue.push(this.milestone.Milestone__c);    
            }
            if(this.milestone.No_Application_Target_Milestone__c !== ''){
                arrayValue1.push(this.milestone.No_Application_Target_Milestone__c);    
            }
            arrayValue.push('None');
            arrayValue1.push('None');
            for (var key of Object.values(this.lstrdtargetmilestone)) {
                if(key !== this.milestone.Milestone__c){
                    arrayValue.push(key);
                }
            }
            for (var key of Object.values(this.lstrdtargetmilestone)) {
                if(key !== this.milestone.No_Application_Target_Milestone__c && key != 'Qualify new application / layers'){
                    arrayValue1.push(key);
                }
            }
            this.arrayValue=arrayValue.filter(Boolean);
            this.arrayValue1=arrayValue1.filter(Boolean);
            this.milepicklist =this.arrayValue;
            this.NoTAMBAmilepicklist =this.arrayValue1;
        
            /*picklist.some(function(item) {
                
            }, this);
            this.arrayValue=arrayValue.filter(Boolean);
            //arrayValue = arrayValue.filter(Boolean);
            return this.arrayValue;*/

        }else if(this.type === 'Production'){
            this.isProd =true;
            //this.milepicklist = this.addValuesToArray(this.milestone.Milestone__c,Object.values(this.lstprodtargetmilestone));
            
            var targetMilestone=this.milestone.Milestone__c;
            if(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)'){
                //|| targetMilestone == 'Maintain PTOR'
                if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                    this.displayCommentsJustification =true;
                }
            }

            const arrayValue=[];
            if(this.milestone.Milestone__c !== ''){
                arrayValue.push(this.milestone.Milestone__c);    
            }
            arrayValue.push('None');
            for (var key of Object.values(this.lstprodtargetmilestone)) {
                if(key !== this.milestone.Milestone__c){
                    arrayValue.push(key);
                }
            }
            this.arrayValue=arrayValue.filter(Boolean);
            this.milepicklist =this.arrayValue;
        }else if(this.type === 'Lite'){
            this.isRd =true;
            //this.milepicklist = this.addValuesToArray(this.milestone.Milestone__c,Object.values(this.lstprodtargetmilestone));
            
            var targetMilestone=this.milestone.No_Application_Target_Milestone__c;
            if(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)'){
                // || targetMilestone == 'Maintain PTOR'
                if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                    this.displayCommentsJustification =true;
                }
                
            }

            const arrayValue=[];
            if(this.milestone.No_Application_Target_Milestone__c !== ''){
                arrayValue.push(this.milestone.No_Application_Target_Milestone__c);    
            }
            arrayValue.push('None');
            for (var key of Object.values(this.lstlitetargetmilestone)) {
                if(key !== this.milestone.No_Application_Target_Milestone__c){
                    arrayValue.push(key);
                }
            }
            this.arrayValue=arrayValue.filter(Boolean);
            this.NoTAMBAmilepicklist =this.arrayValue;
        }

        this.checkdisplayreason();
        if(this.prioritytamba != 'No TAMBA')
        this.tambaArray=this.addLookupValuesToArray(this.localmilestone.TAMBA_Name__c,this.tambarecords);
        /*objectsList({'tambaIds': this.localmilestone.TAMBA_Name__c !== ''?this.localmilestone.TAMBA_Name__c:this.tambarecords })
            .then(result => {
                this.tambaArray =result;
            })
            .catch(error => {
                this.error = error;
                this.accounts = undefined;
            });*/
    }

    addLookupValuesToArray(fieldValue,picklist){
        const arrayValue=[];
        arrayValue.push({key:'None',value:''});
        picklist.some(function(item) {
            if(item.Id !== fieldValue){
                //arrayValue.push(item.value);
                arrayValue.push({key:item.Id,value:item.Name});
            }else{
                arrayValue.unshift({key:fieldValue,value:item.Name});
            }
        }, this);
        this.arrayValue=arrayValue.filter(Boolean);
        return this.arrayValue;
    }

    @wire (getObjectInfo, {objectApiName: Milestone})
    objectInfo;

    /*@track stage=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Stage })
    stagePicklist({data}) {
        if (data) {
            this.stage = this.addValuesToArray(this.milestone.Stage__c,data.values);
        } 
    }*/

    @track primaryreason=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: PrimaryReason })
    primaryreasonPicklist({data}) {
        if (data) {
            this.primaryreason = this.addValuesToArray(this.milestone.Primary_Reason__c,data.values);
        } 
    }

    @track reason=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Reason })
    reasonPicklist({data}) {
        if (data) {
            const reason = this.addValuesToArray(this.milestone.Reason__c,data.values);
            const filteredvalue = reason.filter( item => { 
                if(item != 'None' && this.noTamba == false){
                    return item;
                }else if(this.noTamba == true && (item != 'None' && item != 'New P-TAMBA') ){
                    return item;
                }
               // return item != 'None' || item != '';
            });
            console.log(filteredvalue);
            this.reason=filteredvalue;
        } 
    }

    @track sipobjectives=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: SIPObjective })
    sipobjectivesPicklist({data}) {
        if (data) {
            this.sipobjectives = this.addValuesToArray(this.milestone.SIP_Objective_Owned_by_BM__c,data.values);
        } 
    }

    @track sipReqs=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: SIPReq })
    SIPReqPicklist({data}) {
        if (data) {
            console.log('data--->'+JSON.stringify(data));
            let picklistOptions = [{ label: '--None--', value: '--None--'}];
            data.values.forEach(key => {
                console.log('this.milestone.SIPREQ-->'+this.milestone.SIP_REQ__c);
                console.log('this.milestone.SIP_Objective_Owned_by_BM__c-->'+this.milestone.SIP_Objective_Owned_by_BM__c);
                if(this.milestone.SIP_Objective_Owned_by_BM__c != undefined && this.milestone.SIP_Objective_Owned_by_BM__c == "FY23 MDYR Approved" && key.label == 'FY23 MDYR REQ'){
                    picklistOptions.push({
                        label: key.label, 
                        value: key.value
                    })
                }
                 if(this.milestone.SIP_Objective_Owned_by_BM__c != "FY23 MDYR Approved") {
                    picklistOptions.push({
                        label: key.label, 
                        value: key.value
                    })
                 }
            });
            this.sipReqvalue = this.milestone.SIP_REQ__c;
           this.sipReqs = picklistOptions;
        } 
    }

    @track proof=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Proof })
    proofPicklist({data}) {
        if (data) {
            this.proof = this.addValuesToArray(this.milestone.Proof__c,data.values);
        } 
    }

    @track milepicklist=[];
    @track NoTAMBAmilepicklist=[];
    /*@wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Milestonepicklist })
    milepicklistPicklist({data}) {
        if (data) {
            this.milepicklist = this.addValuesToArray(this.milestone.Milestone__c,data.values);
        } 
    }*/

    @track milestoneStatus=[];
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: MilestoneStatus })
    milestoneStatusPicklist({data}) {
        if (data) {
            console.log('data--->'+JSON.stringify(data.values));
            let picklistOptions = [{ label: '--None--', value: '--None--'}];
            data.values.forEach(key => {
                console.log('this.milestone.Milestone_Status__c-->'+this.milestone.Milestone_Status__c);
                if(this.milestone.Milestone_Status__c == ''){
                    if(key.label == 'On Schedule'){
                        picklistOptions.push({
                            label: key.label, 
                            value: key.value,
                            selected: true
                        })
                        this.localmilestone.Milestone_Status__c = 'On Schedule'; 
                    }else{
                        if(this.subtype =='Lite' && key.label == 'Gone – Application no longer in the flow'){
                           
                        }else{
                            picklistOptions.push({
                                label: key.label, 
                                value: key.value,
                                selected: false
                            })
                        }
                        
                    }
                }else{
                    if(key.label == this.milestone.Milestone_Status__c){
                        picklistOptions.push({
                            label: key.label, 
                            value: key.value,
                            selected: true
                        })
                    }else{
                        if(this.subtype =='Lite' && key.label == 'Gone – Application no longer in the flow'){
                           
                        }else{
                            picklistOptions.push({
                                label: key.label, 
                                value: key.value,
                                selected: false
                            })
                        }
                    }
                }
                
                
            });
           this.milestoneStatus = picklistOptions;
           console.log('this.milestoneStatus--->'+JSON.stringify(data.values));
            //this.milestoneStatus = this.addValuesToArray(this.milestone.Milestone_Status__c,data.values);
        } 
    }

    addValuesToArray(fieldValue,picklist){
        const arrayValue=[];
        if(fieldValue !== ''){
            arrayValue.push(fieldValue);    
        }
        arrayValue.push('None');
        picklist.some(function(item) {
            if(item.value !== fieldValue){
                arrayValue.push(item.value);
            }
        }, this);
        this.arrayValue=arrayValue.filter(Boolean);
        //arrayValue = arrayValue.filter(Boolean);
        return this.arrayValue;
    }

    handleTambaPicklist(event){
        console.log(event.target.value);
        this.localmilestone.TAMBA_Name__c=event.target.value;
    }

    /*handleStage(event){
        this.localmilestone.Stage__c=event.target.value;
    }*/

    handlemilestoneStatus(event){
        console.log('event--->'+event.target.value);
        if(event.target.value != '--None--'){
            this.localmilestone.Milestone_Status__c=event.target.value;
        }else{
            this.localmilestone.Milestone_Status__c='';
        }
        
        this.checkdisplayreason();
    }

    handlesipobjectives(event){
        if(event.target.value != 'None'){
            this.localmilestone.SIP_Objective_Owned_by_BM__c=event.target.value;
            this.hasMidyearSIPREQEditAccess =false;
            this.hasReasonEditAccess =false;
            this.hasCommentsJustificationsEditAccess =false;
        }else{
            this.localmilestone.SIP_Objective_Owned_by_BM__c='';
            this.hasMidyearSIPREQEditAccess =true;
            this.hasReasonEditAccess =true;
            this.hasCommentsJustificationsEditAccess =true;
        }
    }

    handlesipReqs(event){
        if(event.target.value != '--None--'){
            this.localmilestone.SIP_REQ__c=event.target.value;
            if(event.target.value == 'FY23 MDYR REQ'){
                if((this.hasReasonEditAccess || this.hasReasonReadAccess)){
                    this.displayReasonComments =true;
                    this.localmilestone.Reason__c = 'New P-TAMBA';
                    if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                        this.displayCommentsJustification=true;
                    }
                }else{
                    this.displayReasonComments =false;
                    this.localmilestone.Reason__c = '';
                    var targetMilestone=this.localmilestone.Milestone__c;
                    if(!(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR')){
                        this.displayCommentsJustification=false;
                    }
                    
                }
            }
        }else{
            this.localmilestone.SIP_REQ__c='';
            this.displayReasonComments =false;
            this.localmilestone.Reason__c = '';
            var targetMilestone=this.localmilestone.Milestone__c;
            if(!(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR')){
                this.displayCommentsJustification=false;
            }
        }
    }

    handleMidYearchange(event){
        console.log(event.target.checked);
        if(event.target.checked && (this.hasReasonEditAccess || this.hasReasonReadAccess)){
            this.displayReasonComments =true;
            //this.localmilestone.Reason__c = 'New P-TAMBA';
            if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                this.displayCommentsJustification=true;
            }
        }else{
            this.displayReasonComments =false;
            //this.localmilestone.Reason__c = '';
            var targetMilestone=this.localmilestone.Milestone__c;
            if(!(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR')){
                this.displayCommentsJustification=false;
            }
            
        }
        this.localmilestone.Mid_year_SIP_REQ__c =event.target.checked;
    }

    handlePrimaryReason(event){
        if(event.target.value != 'None'){
            this.localmilestone.Primary_Reason__c=event.target.value;
        }else{
            this.localmilestone.Primary_Reason__c='';
        }
        
    }

    handleproof(event){
        if(event.target.value != 'None'){
            this.localmilestone.Proof__c=event.target.value;
        }else{
            this.localmilestone.Proof__c='';
        }
    }

    handleCommentsJust(event){
        this.localmilestone.Comments_Justifications__c=event.target.value;
    }

    handleNoAppTargetMilestn(event){
        this.localmilestone.No_Application_Target_Milestone__c=event.target.value;
    }

    handleAddInfo(event){
        console.log('event.target.value--->'+(event.target.value).length);
        var max_chars = 255;
    if((event.target.value).length > max_chars) {
        event.target.value = (event.target.value).substr(0, max_chars);
        this.localmilestone.Additional_Information__c = event.target.value;
    }
    if((event.target.value).length < max_chars){
        this.localmilestone.Additional_Information__c = event.target.value;
    }
        
    }

    checkdisplayreason(){
        var statusvalue =this.localmilestone.Milestone_Status__c;
        //console.log('statusvalue::'+statusvalue);
        let targetMilestone = '';
        if(this.prioritytamba == 'No TAMBA'){
            targetMilestone=this.localmilestone.No_Application_Target_Milestone__c;
        }else{
            targetMilestone=this.localmilestone.Milestone__c;
        }
        
        //console.log(statusvalue);
        if(statusvalue === 'Achieved' && (targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)')){ // || statusvalue === 'Lost – no longer engaging' || statusvalue === 'Gone' || statusvalue === 'Cancelled'
            this.displayreason=false;
            this.displayproof =true;
        }else if(statusvalue === 'Lost – no longer engaging' || statusvalue === 'Lost' || statusvalue === 'Forfeit - BU decided not to pursue'){
            this.displayreason=true;
            this.displayproof =false;
        }else{
            this.displayreason=false;
            this.displayproof=false;
            this.localmilestone.Primary_Reason__c='';
            this.localmilestone.Proof__c='';
            this.localmilestone.Additional_Information__c='';
        }
    }

    handlemilepicklist(event){
        this.localmilestone.Milestone__c=event.target.value;
        var targetMilestone=this.localmilestone.Milestone__c;
        console.log(this.localmilestone.Id == '');
        console.log((this.localmilestone.Target_Date__c =='' || this.localmilestone.Id == ''));
        console.log((this.localmilestone.Target_Date__c =='' || this.localmilestone.Id == '') && this.localmilestone.TAMBA_Name__c != '');
        if((this.localmilestone.Target_Date__c =='' || this.localmilestone.Target_Date__c == undefined || this.localmilestone.Id == '') && this.localmilestone.TAMBA_Name__c != ''){
            if((targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)')){
                this.localmilestone.Target_Date__c=this.maptamba[this.localmilestone.TAMBA_Name__c].DTOR_Date__c;
            }else if((targetMilestone == 'Maintain PTOR' || targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)') && this.subtype != 'Lite'){
                this.localmilestone.Target_Date__c=this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
            }
            console.log('this.subtype---->'+this.subtype);
            if(this.subtype =='Lite'){
                if((targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)')){
                    this.localmilestone.Target_Date__c=this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
                }else if(targetMilestone == 'Maintain PTOR'){
                    this.localmilestone.Target_Date__c = '';
                }
            }
        }

        if((targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR')){
            if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                this.displayCommentsJustification=true;
            }
        }else{
            this.displayCommentsJustification=false;
        }
        this.checkdisplayreason();

        // if(targetMilestone == 'Successful Demo'){
        //     this.onSuccessfulldemo = true;
        //     this.sipReqvalue = '--None--';
        // }else {
        //     this.onSuccessfulldemo = false;
        // }
    }

    handleNoTambamilepicklist(event){
        this.localmilestone.No_Application_Target_Milestone__c=event.target.value;
        var targetMilestone=this.localmilestone.No_Application_Target_Milestone__c;
        console.log(this.localmilestone.Id == '');
        console.log((this.localmilestone.Target_Date__c =='' || this.localmilestone.Id == ''));
        console.log((this.localmilestone.Target_Date__c =='' || this.localmilestone.Id == '') && this.localmilestone.TAMBA_Name__c != '');
        if((this.localmilestone.Target_Date__c =='' || this.localmilestone.Target_Date__c == undefined || this.localmilestone.Id == '') && this.localmilestone.TAMBA_Name__c != ''){
            if((targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)')){
                this.localmilestone.Target_Date__c=this.maptamba[this.localmilestone.TAMBA_Name__c].DTOR_Date__c;
            }else if((targetMilestone == 'Maintain PTOR' || targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)') && this.subtype != 'Lite'){
                this.localmilestone.Target_Date__c=this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
            }
            console.log('this.subtype---->'+this.subtype);
            if(this.subtype =='Lite'){
                if((targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)')){
                    this.localmilestone.Target_Date__c=this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
                }else if(targetMilestone == 'Maintain PTOR'){
                    this.localmilestone.Target_Date__c = '';
                }
            }
        }

        if((targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR')){
            if(this.hasCommentsJustificationsEditAccess || this.hasCommentsJustificationsReadAccess){
                this.displayCommentsJustification=true;
            }
        }else{
            this.displayCommentsJustification=false;
        }
        this.checkdisplayreason();

        // if(targetMilestone == 'Successful Demo'){
        //     this.onSuccessfulldemo = true;
        //     this.sipReqvalue = '--None--';
        // }else {
        //     this.onSuccessfulldemo = false;
        // }
    }

    handleReasonpicklist(event){
        this.localmilestone.Reason__c=event.target.value;
    }

    handleTargetdate(event){
        this.localmilestone.Target_Date__c=event.target.value;
    }

    proddeleteSelected(){
        console.log('proddeleteSelected');
        const deleteEvent = new CustomEvent("deleteselected", {
            detail: this.selectedvalue
        });
    
        // Dispatches the event.
        this.dispatchEvent(deleteEvent);
    }

    deleteSelected(){
        console.log('deleteSelected');
        console.log('this.selectedvalue'+this.selectedvalue);
        const deleteEvent = new CustomEvent("deleteselected", {
            detail : this.selectedvalue
        });
        // Dispatches the event.
        this.dispatchEvent(deleteEvent);
    }

    @api passValues() {
        this.handlerValueChange();
    }

    handlerValueChange(){
        console.log('::handlerValueChange Start::');
        console.log(this.localmilestone);
        console.log(JSON.stringify(this.localmilestone));
        console.log(this.localmilestone.TAMBA_Name__c);
        console.log(JSON.stringify(this.localmilestone.TAMBA_Name__c) ==="");
        if((this.localmilestone.TAMBA_Name__c === '' || this.localmilestone.TAMBA_Name__c === null) && this.prioritytamba != 'No TAMBA'){
            this.localmilestone.TAMBA_Name__c =this.tambarecords[0];
        }

        if(this.prioritytamba != 'No TAMBA' && ((JSON.stringify(this.localmilestone.TAMBA_Name__c)).includes("Name") || (this.localmilestone.TAMBA_Name__c === '' || this.localmilestone.TAMBA_Name__c === null))){
            this.hasError =true;
            this.errorMessage ='Tamba Name should not be null';
        }


        let targetMilestone=this.localmilestone.Milestone__c;
        let status=this.localmilestone.Milestone_Status__c;
        let statusvalue=this.localmilestone.Milestone_Status__c;
        console.log(statusvalue);
        let sipreq=this.localmilestone.SIP_REQ__c;
        if(sipreq == 'FY23 MDYR REQ'){
            if(this.localmilestone.Reason__c == 'None' || this.localmilestone.Reason__c == '' || this.localmilestone.Reason__c == undefined){
                this.hasError =true;
                this.errorMessage ='Reason(Owned by Account) should not be null';
            }
        }
        //this.milestone.SIP_REQ__c
        if(statusvalue === 'Lost – no longer engaging' || statusvalue === 'Lost' || statusvalue === 'Forfeit - BU decided not to pursue'){
            console.log(this.localmilestone.Primary_Reason__c) 
            if(this.localmilestone.Primary_Reason__c == '' || this.localmilestone.Primary_Reason__c == undefined){
                this.hasError =true;
                this.errorMessage ='Primary Reason should not be null';
            }

            if(this.localmilestone.Additional_Information__c == '' || this.localmilestone.Additional_Information__c == undefined){
                this.hasError =true;
                this.errorMessage ='Additional Information should not be null';
            }
        }else if(statusvalue === 'Achieved' && this.localmilestone.Proof__c == '' && (targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)')){
                this.hasError =true;
                this.errorMessage ='Proof should not be null';
        }else if((this.localmilestone.Comments_Justifications__c == undefined || this.localmilestone.Comments_Justifications__c == '') && (targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)')){
                this.hasError =true;
                this.errorMessage ='Milestone Objective Details/SIP Justification should not be null';
        }

        
        if(this.localmilestone.Target_Date__c != '' && this.localmilestone.Target_Date__c != undefined){
            var d = new Date();
            console.log(d);
            var dueDate=this.localmilestone.Target_Date__c;
            console.log(dueDate);
            var targetdate=dueDate.split('-');
            var dueDateDateFormat = new Date(dueDate);
            console.log(dueDateDateFormat);
            console.log(dueDateDateFormat < d);
            if((dueDateDateFormat < d) && (statusvalue =='On Schedule')){ //|| statusvalue =='Behind / At risk'
                this.hasError =true;
                this.errorMessage ='Milestone Due Date is passed. Please update Milestone Status or Milestone Due Date';
            }else if(statusvalue != 'Achieved' && statusvalue !='Not Achieved – but continue to engage' && statusvalue !='Lost – no longer engaging' && statusvalue !='Forfeit - BU decided not to pursue' && statusvalue !='Gone – Application no longer in the flow'){
                if(targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' && this.maptamba[this.localmilestone.TAMBA_Name__c] != undefined){
                    var tambadtorDate=this.maptamba[this.localmilestone.TAMBA_Name__c].DTOR_Date__c;
                    console.log('tambadtorDate::'+tambadtorDate);
                    if(tambadtorDate != null && tambadtorDate != undefined){
                        var dtorDate = tambadtorDate.split('-');
                        if(!(dtorDate[1] === targetdate[1] && dtorDate[0] === targetdate[0])){
                            this.hasError =true;
                            this.errorMessage ='Please match Milestone Due Date with TAMBA DTOR date';
                        }
                    }
                }else if(targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)' && this.maptamba[this.localmilestone.TAMBA_Name__c] != undefined){
                    var tambaptorDate=this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
                    if(tambaptorDate != null && tambaptorDate != undefined){
                        var ptorDate = tambaptorDate.split('-');
                        if(!(ptorDate[1] === targetdate[1] && ptorDate[0] === targetdate[0])){
                            this.hasError =true;
                            this.errorMessage ='Please match Milestone Due Date with TAMBA PTOR date';
                        }
                    }
                }
            }
            
            
            // else if((targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)') && 
            // (status != 'Achieved' || status !='Not Achieved – but continue to engage' || status !='Lost – no longer engaging' || status !='Forfeit - BU decided not to pursue' || status !='Gone – Application no longer in the flow')){
            //     var tambadtorDate=this.maptamba[this.localmilestone.TAMBA_Name__c].DTOR_Date__c;
            //     console.log('tambadtorDate::'+tambadtorDate);
            //     if(tambadtorDate != null && tambadtorDate != undefined){
            //         var dtorDate = tambadtorDate.split('-');
            //         if(!(dtorDate[1] === targetdate[1] && dtorDate[0] === targetdate[0])){
            //             this.hasError =true;
            //             this.errorMessage ='Please match Milestone Due Date with TAMBA DTOR date';
            //         }
            //     }
            // }else if((targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)') && 
            // (status != 'Achieved' || status !='Not Achieved – but continue to engage' || status !='Lost – no longer engaging' || status !='Forfeit - BU decided not to pursue' || status !='Gone – Application no longer in the flow')){
            //     var tambaptorDate=this.maptamba[this.localmilestone.TAMBA_Name__c].PTOR_Date__c;
            //     if(tambaptorDate != null && tambaptorDate != undefined){
            //         var ptorDate = tambaptorDate.split('-');
            //         if(!(ptorDate[1] === targetdate[1] && ptorDate[0] === targetdate[0])){
            //             this.hasError =true;
            //             this.errorMessage ='Please match Milestone Due Date with TAMBA PTOR date';
            //         }
            //     }
            // }
        }

        if(this.localmilestone.Mid_year_SIP_REQ__c){ 
            if(this.localmilestone.Comments_Justifications__c =='' || this.localmilestone.Comments_Justifications__c == undefined ){ //&& (targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)' || targetMilestone == 'Maintain PTOR')
                this.hasError =true;
                this.errorMessage ='Comments/Justification should not be null';
            }else if(this.localmilestone.Reason__c == undefined || this.localmilestone.Reason__c == '' || this.localmilestone.Reason__c =='None'){
                this.hasError =true;
                this.errorMessage ='Reason should not be blank';
            }
        }

        console.log('this.isRd'+this.isRd);
        console.log('this.isRd'+this.prodmilestonecount);
        console.log('this.isRd'+this.prodmilestonecount <= 7);
        if(this.isRd && this.rdmilestonecount <= 6 && (targetMilestone == 'Co PTOR (with $ PO)' || targetMilestone == 'Sole-PTOR (with $ PO)')){
            this.hasError =true;
            this.errorMessage ='This is R&D section, please move PTOR Target Milestone to Production';
        }else if(!this.isRd && this.prodmilestonecount <= 7 && (targetMilestone == 'Co-DTOR (with $ PO)' || targetMilestone == 'Sole-DTOR (with $ PO)')){
            this.hasError =true;
            this.errorMessage ='This is Production section, please move DTOR Target Milestone to R&D';
        }

        if(this.hasError){
            console.log(this.errorMessage);
            const valuechange = new CustomEvent("error", {detail: this.errorMessage});
            this.dispatchEvent(valuechange);
            this.hasError =false;
            return;
        }


        const localValue=this.localmilestone;
        console.log('localValue'+localValue);
        /*const demoValue = Object.values(localValue);
        console.log(demoValue);*/

        console.log('delete:'+this.localmilestone.Target_Date__c);
        console.log('delete:'+this.localmilestone.SIP_Objective_Owned_by_BM__c);
        console.log('delete:'+this.localmilestone.Milestone_Status__c);
        console.log(this.localmilestone.Target_Date__c == null);
        console.log(this.localmilestone.SIP_Objective_Owned_by_BM__c == null);
        console.log(this.localmilestone.Milestone_Status__c == null);

        const targetdatecheck = this.localmilestone.Target_Date__c;
        const SIPObjectiveOwnedbyBM = this.localmilestone.SIP_Objective_Owned_by_BM__c;
        const milestonestatus = this.localmilestone.Milestone_Status__c;

        if((targetdatecheck == null || targetdatecheck == '' || targetdatecheck == undefined )&& 
            (SIPObjectiveOwnedbyBM ==null || SIPObjectiveOwnedbyBM ==''  || SIPObjectiveOwnedbyBM == undefined )&&
            (milestonestatus == null || milestonestatus == '' || milestonestatus == undefined)){

            const valuechange = new CustomEvent("valuechanged", {
                detail: this.selectedvalue + '--'+'"Delete"',
            });
            this.dispatchEvent(valuechange);
        }else{
            const valuechange = new CustomEvent("valuechanged", {
                detail: this.selectedvalue + '--'+JSON.stringify(localValue),
            });
            this.dispatchEvent(valuechange);    
        }

        
        
        // Dispatches the event.
        
        console.log('::handlerValueChange End::');
    }
}