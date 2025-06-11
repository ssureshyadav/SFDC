/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable no-eval */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
import { track,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import saveData from '@salesforce/apex/SOOLWCEdit.saveChildRecords';
import objectsList from '@salesforce/apex/SOOLWCEdit.loadmilestone';
import loadTamba from '@salesforce/apex/SOOLWCEdit.loadtambaIds';
import hasMilestoneStatusAccess from '@salesforce/apex/SOOLWCEdit.hasMilestoneStatusAccess';

import SOOLightningElement from 'c/sOOLightningElement';

//let maptamba = new Map();

export default class Soomilestones extends SOOLightningElement {
    @track bubm=false;
    @api tambarecords;
    @track tambaArray;
    @track soodid;
    @track litemilestonecount;
    @track rdmilestonecount;
    @track prodmilestonecount;
    @track hasStatusAccess;
    @track hasAccess;
    @track hasDeleteAccess;
    @track hasMidyearSIPREQReadAccess;
    @track hasMidyearSIPREQEditAccess;
    @track hasReasonReadAccess;
    @track hasReasonEditAccess;
    @track hasCommentsJustificationsReadAccess;
    @track hasCommentsJustificationsEditAccess;
    @track hasErrors=false;
    @track errorMessage=false;
    @track autoPopulateRD=false;
    @track autoPopulateProd=false;
    @track autoPopulateLite=false;
    @track lstRDTargetMilestone=[];
    @track lstLiteTargetMilestone=[];
    @track lstProdTargetMilestone=[];
    @track lstrdduplicateTambaAutomatic=[];
    @track lstprodduplicateTambaAutomatic=[];
    @track lstliteduplicateTambaAutomatic=[];
    @track maptamba = new Map();
    @api prioritytamba = '';
    @track noTamba = false;
    @api businessunit = '';
    @api hasnotambaerror;

    @api
    get createrdNewRecords(){
        return (this.lstrdduplicateTambaAutomatic.length>0)?true:false;
    }

    @api
    get createrdNewLiteRecords(){
        return (this.lstliteduplicateTambaAutomatic.length>0)?true:false;
    }

    @api
    get createProdNewRecords(){
        return (this.lstprodduplicateTambaAutomatic.length>0)?true:false;
    }

    @api
    get disableautoPopulateRD(){
        return (this.autoPopulateRD)?true:false;
    }

    @api
    get disableautoPopulateLite(){
        return (this.autoPopulateLite)?true:false;
    }

    

    @api
    get disableautoPopulateProd(){
        return (this.autoPopulateProd)?true:false;
    }

    

    connectedCallback(){
        if(this.prioritytamba == 'No TAMBA'){
            this.noTamba = true;
        }else{
            this.noTamba = false;
        }
        this.obj = {
            Id :'',
            Name : '',
            TAMBA_Name__c :'',
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
        }//Stage__c : '',
        this.prodobj =this.obj;

        console.log('Tamba records::'+this.tambarecords);
        console.log('this.recordId------>'+JSON.stringify(this.recordId));
        
        objectsList({'recordid': this.recordId })
            .then(response => {
                //decision Makers Logic
                console.log('Server Call Start');
                console.log('response--->'+JSON.stringify(response));
                let tambaIds=[];
                const result=response.wrapper;
                if(this.type != 'Lite'){
                this.tambarecords =response.lstTamba;
                }
                console.log('result------>'+this.tambarecords);
                let rdduplicateTamba=[];
                let prodduplicateTamba=[];
                let liteduplicateTamba=[];
                this.hasAccess =response.hasAccess; 
                this.hasDeleteAccess =response.hasDeleteAccess;

                this.hasMidyearSIPREQReadAccess=response.hasMidyearSIPREQReadAccess;
                this.hasReasonReadAccess=response.hasReasonReadAccess;
                this.hasCommentsJustificationsReadAccess=response.hasCommentsJustificationsReadAccess;

                this.hasMidyearSIPREQEditAccess=response.hasMidyearSIPREQEditAccess;
                this.hasReasonEditAccess=response.hasReasonEditAccess;
                this.hasCommentsJustificationsEditAccess=response.hasCommentsJustificationsEditAccess;

                for(var i=0;i<this.tambarecords.length;i++){
                    rdduplicateTamba.push(this.tambarecords[i]);
                    prodduplicateTamba.push(this.tambarecords[i]);
                    liteduplicateTamba.push(this.tambarecords[i]);
                }
                //maptamba.set(rec.Name,rec.Id);
                this.maptamba = response.mapTamba;
                console.log('response.mapTamba--->'+JSON.stringify(response.mapTamba));
                console.log('this.maptamba--->'+JSON.stringify(this.maptamba));
                //console.log('rdduplicateTamba::'+rdduplicateTamba);
                if(result.lstRecordsRd.length>0){
                    for(var i=0; i < result.lstRecordsRd.length; i++) {
                        this.mutatorMethod(result.lstRecordsRd[i]);
                        tambaIds.push(result.lstRecordsRd[i].TAMBA_Name__c);
                        const index = rdduplicateTamba.indexOf(result.lstRecordsRd[i].TAMBA_Name__c);
                        if (index > -1) {
                            rdduplicateTamba.splice(index, 1);
                        }
                    }
                }else{
                    //this.objcmpcount.push({label :"1",value:this.obj});
                }

                //console.log('rdduplicateTamba::'+rdduplicateTamba);
                
                if(result.lstRecordsProduction.length>0){
                    for(var j=0; j < result.lstRecordsProduction.length; j++) {
                        this.mutatorprodMethod(result.lstRecordsProduction[j]);
                        tambaIds.push(result.lstRecordsProduction[j].TAMBA_Name__c);
                        const index = prodduplicateTamba.indexOf(result.lstRecordsProduction[j].TAMBA_Name__c);
                        if (index > -1) {
                            prodduplicateTamba.splice(index, 1);
                        }
                    }
                }else{
                    //this.prodobjcmpcount.push({label :"1",value:this.prodobj});
                }

                if(result.lstRecordsLite.length>0){
                    for(var j=0; j < result.lstRecordsLite.length; j++) {
                           // this.mutatorLiteMethod(result.lstRecordsLite[j]);
                            tambaIds.push(result.lstRecordsLite[j].TAMBA_Name__c);
                            const index = liteduplicateTamba.indexOf(result.lstRecordsLite[j].TAMBA_Name__c);
                            if (index > -1) {
                                liteduplicateTamba.splice(index, 1);
                            }
                    }
                }

                if(rdduplicateTamba.length > 0){
                    this.lstrdduplicateTambaAutomatic =rdduplicateTamba;
                }

                this.lstRDTargetMilestone =response.lstRDTargetMilestone;

                if(prodduplicateTamba.length > 0){
                    this.lstprodduplicateTambaAutomatic =prodduplicateTamba;
                }
                if(liteduplicateTamba.length > 0){
                    this.lstliteduplicateTambaAutomatic =liteduplicateTamba;
                    console.log('this.lstliteduplicateTambaAutomatic.length...'+this.lstliteduplicateTambaAutomatic.length);
                }

                this.lstProdTargetMilestone =response.lstProdTargetMilestone;
                this.lstLiteTargetMilestone = response.lstLiteTargetMilestone;
                console.log('lstLiteTargetMilestone--->'+JSON.stringify(this.lstLiteTargetMilestone));
                const substring = "PDC";
                console.log('this.businessunit--->'+this.businessunit);
                if(!this.businessunit.includes(substring)){
                    const index = this.lstLiteTargetMilestone.indexOf('Qualify new application / layers');
                    if (index > -1) {
                        this.lstLiteTargetMilestone.splice(index, 1);
                    }
                }
                
                console.log('this.lstLiteTargetMilestone--->'+this.lstLiteTargetMilestone);
                /*Logic moved to checkbox button*/
                /*
                console.log('response.lstRDTargetMilestone::'+response.lstRDTargetMilestone);
                
                this.rdmilestonecount =response.lstRDTargetMilestone.length;

                if(rdduplicateTamba.length > 0){
                    const targetmilestone=response.lstRDTargetMilestone;
                    //let lstmilestones=[];
                    for(var t=0; t <rdduplicateTamba.length; t++) {
                        for(var i=0; i <targetmilestone.length; i++) {
                            let customMilestone={};
                            customMilestone.Milestone__c = targetmilestone[i];
                            customMilestone.TAMBA_Name__c =rdduplicateTamba[t];
                            customMilestone.Id ='';
                            customMilestone.Application_Name__c ='';
                            customMilestone.Customer_Engagement1__c ='';
                            customMilestone.Target_Date__c='';
                            customMilestone.SIP_Objective_Owned_by_BM__c='';
                            customMilestone.Milestone_Status__c='';
                            customMilestone.Prioritized_TAMBA_FYs__c ='';
                            customMilestone.Additional_Information__c ='';
                            customMilestone.Primary_Reason__c='';
                            customMilestone.Proof__c='';
                            customMilestone.Comments_Justifications__c='',
                            customMilestone.Reason__c='',
                            customMilestone.Mid_year_SIP_REQ__c=false,
                            this.mutatorMethod(customMilestone);
                            *if(targetmilestone.length > 7 && targetmilestone[i] == 'Maintain PTOR'){
                               
                            }else if(targetmilestone[i] != 'Maintain PTOR'){
                                this.mutatorMethod(customMilestone);
                            }*
                            //this.objcmpcount.push(...lstmilestones);
                            //this.prodobjcmpcount.push(...lstmilestones);
                            //lstmilestones.push(customMilestone);
                        }
                    }
                }*/

                /*Logic moved to checkbox button*/
                /*
                console.log('response.lstProdTargetMilestone::'+response.lstProdTargetMilestone);
                this.prodmilestonecount =response.lstProdTargetMilestone.length;
                
                if(prodduplicateTamba.length > 0){
                    const targetmilestone=response.lstProdTargetMilestone;
                    //let lstmilestones=[];
                    for(var t=0; t <prodduplicateTamba.length; t++) {
                        for(var i=0; i <targetmilestone.length; i++) {
                            let customMilestone={};
                            customMilestone.Milestone__c = targetmilestone[i];
                            customMilestone.TAMBA_Name__c =prodduplicateTamba[t];
                            customMilestone.Id ='';
                            customMilestone.Application_Name__c ='';
                            customMilestone.Customer_Engagement1__c ='';
                            customMilestone.Target_Date__c='';
                            customMilestone.SIP_Objective_Owned_by_BM__c='';
                            customMilestone.Milestone_Status__c='';
                            customMilestone.Prioritized_TAMBA_FYs__c ='';
                            customMilestone.Additional_Information__c ='';
                            customMilestone.Primary_Reason__c='';
                            customMilestone.Proof__c='';
                            customMilestone.Comments_Justifications__c='',
                            customMilestone.Reason__c='',
                            customMilestone.Mid_year_SIP_REQ__c=false,
                            this.mutatorprodMethod(customMilestone);
                            //this.objcmpcount.push(...lstmilestones);
                            //this.prodobjcmpcount.push(...lstmilestones);
                            //lstmilestones.push(customMilestone);
                        }
                    }
                }*/

                console.log('Server Call End');
                console.log(tambaIds);
                //tambaIds.push.apply(tambaIds, this.tambarecords);
                if(this.type == 'Lite'){
                    this.handletambarecords(this.tambarecords);
                }else{
                    this.handletambarecords(tambaIds);
                }
                
            })
            .catch(error => {
                this.error = error;
            });

        hasMilestoneStatusAccess()
            .then(response => {
                //decision Makers Logic
                console.log('Server Call Start');
                console.log(response);
                this.hasStatusAccess =!response;
            })
        
        /*console.log('selectedtambarecords::::'+this.selectedtambarecords.length);
        if(this.selectedtambarecords.length === 0){
            const nextTab = new CustomEvent("save", {
                detail : {tabName : '1' , isparent : true}
            });
            this.dispatchEvent(nextTab);
        }*/
        if(this.type === 'RD'){
            this.isRd =true;
        }else if(this.type === 'Production'){
            this.isProd =true;
        }else if(this.type === 'Lite'){
            this.isLite =true;
        }
    }

    @track checkSIPObjectiveValue = false;
    showCheckSIP(event){
        this.checkSIPObjectiveValue = event.detail;
    }
    handletambarecords(tambaIds){
        console.log('this.tambarecords---->'+this.tambarecords);
        this.tambarecords.forEach(function(value){
            console.log('tambarecord Value'+value);
            if (tambaIds.indexOf(value)===-1){ 
                tambaIds.push(value);
            }
        });
        console.log('tambaIds---->'+tambaIds);
        //this.tambaArray =this.tambarecords;
        if(tambaIds.length >0){
            loadTamba({'tambaIds': tambaIds })
            .then(resultData => {
                this.tambaArray =resultData;
                console.log('this.tambaArray--->'+JSON.stringify(this.tambaArray));
            })
        }
    }

    handleSubmit(event) {
		event.preventDefault(); // stop form submission
        console.log(this.objcmpcount.length);
        console.log(this.prodobjcmpcount.length);

        this.template.querySelectorAll("c-create-milestones").forEach(element => {
                element.passValues();
        });

        if(this.hasErrors){
            alert(this.errorMessage);
            this.hasErrors =false;
            const nextTab = new CustomEvent("save", {
                detail : {tabName : '1' , isparent : false}
            });
            this.dispatchEvent(nextTab);
            return;
        }
        
		console.log('onsubmit: '+ event.detail.fields);
        console.log(this.isProd);
        const fields = event.detail.fields;
        if(this.isProd){
            fields.MilestoneProdCompletion__c =false;
            if(this.prodobjcmpcount.length >0){
                for(var i=0; i < this.prodobjcmpcount.length; i++) {
                    console.log(this.prodobjcmpcount[i].value)
                    var record = JSON.parse(this.prodobjcmpcount[i].value);
                    if(record.Milestone__c != '' && record.Milestone__c != undefined
                        && record.Target_Date__c != '' && record.Target_Date__c != undefined
                        && record.Milestone_Status__c != '' && record.Milestone_Status__c != undefined
                    ){
                        fields.MilestoneProdCompletion__c =true;
                    }else{
                        fields.MilestoneProdCompletion__c =false;
                        break;
                    }
                }

                for(var i=0; i < this.prodobjcmpcount.length; i++) {
                    console.log(this.prodobjcmpcount[i].value)
                    var record = JSON.parse(this.prodobjcmpcount[i].value);
                    console.log('--->'+record.Milestone__c);
                    console.log('--->'+record.Comments_Justifications__c);
                    if(record.Milestone__c == 'Maintain PTOR' && (record.Comments_Justifications__c == undefined || record.Comments_Justifications__c == '')){
                        const hasnotambaerror = new CustomEvent("haserror", {
                            detail : {hasnotambaerror : true}
                        });
                        this.dispatchEvent(hasnotambaerror);
                    alert('Please Enter Milestone Objective Details/SIP Justification field for Maintain PTOR.');
                    return;
                    }else{
                        const hasnotambaerror = new CustomEvent("haserror", {
                            detail : {hasnotambaerror : false}
                        });
                        this.dispatchEvent(hasnotambaerror);
                    }
                }
            }
        }else{
            fields.MilestoneRDCompletion__c =false;
            if(this.objcmpcount.length >0){
                for(var i=0; i < this.objcmpcount.length; i++) {
                    console.log(this.objcmpcount[i].value)
                    var record = JSON.parse(this.objcmpcount[i].value);
                    if(record.Milestone__c != '' && record.Milestone__c != undefined
                        && record.Target_Date__c != '' && record.Target_Date__c != undefined
                        && record.Milestone_Status__c != '' && record.Milestone_Status__c != undefined
                    ){
                        fields.MilestoneRDCompletion__c =true;
                    }else{
                        fields.MilestoneRDCompletion__c =false;
                        break;
                    }
                }
                
                for(var i=0; i < this.objcmpcount.length; i++) {
                    console.log(this.objcmpcount[i].value)
                    var record = JSON.parse(this.objcmpcount[i].value);
                    if(this.noTamba == true && (record.Comments_Justifications__c == undefined || record.Comments_Justifications__c == '')){
                        const hasnotambaerror = new CustomEvent("haserror", {
                            detail : {hasnotambaerror : true}
                        });
                        this.dispatchEvent(hasnotambaerror);
                       alert('Please Enter Milestone Objective Details/SIP Justification field.');
                       return;
                    }else{
                        const hasnotambaerror = new CustomEvent("haserror", {
                            detail : {hasnotambaerror : false}
                        });
                        this.dispatchEvent(hasnotambaerror);
                    }
                }

                for(var i=0; i < this.objcmpcount.length; i++) {
                    console.log(this.objcmpcount[i].value)
                    var record = JSON.parse(this.objcmpcount[i].value);
                if(this.noTamba == false && record.Milestone__c == 'Maintain PTOR' && (record.Comments_Justifications__c == undefined || record.Comments_Justifications__c == '')){
                    const hasnotambaerror = new CustomEvent("haserror", {
                        detail : {hasnotambaerror : true}
                    });
                    this.dispatchEvent(hasnotambaerror);
                   alert('Please Enter Milestone Objective Details/SIP Justification field for Maintain PTOR.');
                   return;
                }else{
                    const hasnotambaerror = new CustomEvent("haserror", {
                        detail : {hasnotambaerror : false}
                    });
                    this.dispatchEvent(hasnotambaerror);
                }
            }
                
            }
        }
        console.log(JSON.stringify(fields));
        this.template.querySelector('lightning-record-edit-form').submit(fields);
	}

    @api
    addTamba(tRecords){
        //console.log(this.selectedtambarecords);
        console.log('milestone:addTamba '+tRecords);
        //this.selectedtambarecords =tRecords;
        this.handletambarecords(tRecords);
        //this.milestone.TAMBA_Name__c =this.selectedtambarecords[0];
       /* for(var i=0;i<tambaRecords.length;i++){
            this.selectedtambarecords.push(tambaRecords[i]);
        }*/
    }

    handleBUBM(event){
        console.log(event.detail);
        console.log(event.detail.checked);
        this.bubm =event.detail.checked;
    }

    copyRandD(event){
        if(event.target.checked){
            console.log(this.objcmpcount.length);
            for(var i=0; i < this.objcmpcount.length; i++) {
                var record = this.objcmpcount[i].value;
                if(record.TAMBA_Name__c !== ''){
                this.prodobjcmpcount =[...this.prodobjcmpcount,{
                    label:  this.objcmpcount[i].label,   //maybe use index?
                    value: {
                        TAMBA_Name__c:record.TAMBA_Name__c,
                        Application_Name__c:record.Application_Name__c,
                        Customer_Engagement1__c:record.Customer_Engagement1__c,
                        Stage__c:record.Stage__c,
                        Milestone__c:record.Milestone__c,
                        Target_Date__c:record.Target_Date__c,
                        Milestone_Status__c:record.Milestone_Status__c,
                        Prioritized_TAMBA_FYs__c:record.Prioritized_TAMBA_FYs__c,
                        Additional_Information__c:record.Additional_Information__c,
                        Primary_Reason__c:record.Primary_Reason__c,
                        Proof__c:record.Proof__c,
                        Comments_Justifications__c:record.Comments_Justifications__c,
                        Reason__c:record.Reason__c,
                        Mid_year_SIP_REQ__c:record.Mid_year_SIP_REQ__c,
                        SIP_REQ__c : record.SIP_REQ__c,
                        Id:'',
                    }
                }];
                }
             }
        }else{
            const prodRecords=this.prodobjcmpcount;
            for(var j=0; j < prodRecords.length; j++) {
                for(var k=0; k < this.objcmpcount.length; k++) {
                    if(this.objcmpcount[k].label=== prodRecords[j].label){
                        this.prodobjcmpcount.splice(j,1);     
                    }
                 }
             }
        }
    }

    handleSaveClick(){
        this.save();
    }

    autoPopulateRDchange(event){
        console.log(event.target.checked);
        
        this.autoPopulateRD =event.target.checked;
       /* if(event.target.checked){
            var r = confirm("Are you sure you want to auto populate milestones");
            if (r === false) {
                return;
            }
        }*/

        this.rdmilestonecount =this.lstRDTargetMilestone.length;
        let rdduplicateTamba=this.lstrdduplicateTambaAutomatic;
        console.log(rdduplicateTamba);
        console.log(JSON.stringify(rdduplicateTamba));
        if(rdduplicateTamba.length > 0){
            const targetmilestone=this.lstRDTargetMilestone;
            const targetmilestonelite=this.lstLiteTargetMilestone;
            //let lstmilestones=[];
            for(var t=0; t <rdduplicateTamba.length; t++) {
                if(this.type =='Lite'){
                    for(var i=0; i <targetmilestonelite.length; i++) {
                        var milestonevalue=targetmilestonelite[i];
                        let customMilestone={};
                        customMilestone.Milestone__c = milestonevalue;
                        customMilestone.TAMBA_Name__c =rdduplicateTamba[t];
                        customMilestone.Id ='';
                        customMilestone.Application_Name__c ='';
                        customMilestone.Customer_Engagement1__c ='';
                        customMilestone.Target_Date__c='';
                        if((milestonevalue == 'Co-DTOR (with $ PO)' || milestonevalue == 'Sole-DTOR (with $ PO)')){
                            customMilestone.Target_Date__c=this.maptamba[customMilestone.TAMBA_Name__c].DTOR_Date__c;
                        }
                        if((milestonevalue == 'Co PTOR (with $ PO)' || milestonevalue == 'Sole-PTOR (with $ PO)') ){
                            customMilestone.Target_Date__c=this.maptamba[customMilestone.TAMBA_Name__c].PTOR_Date__c;
                        }
                        if(milestonevalue == 'Maintain PTOR'){
                            customMilestone.Target_Date__c = '';
                        }
                        
                        customMilestone.SIP_Objective_Owned_by_BM__c='';
                        customMilestone.Milestone_Status__c='';
                        customMilestone.Prioritized_TAMBA_FYs__c ='';
                        customMilestone.Additional_Information__c ='';
                        customMilestone.Primary_Reason__c='';
                        customMilestone.Proof__c='';
                        customMilestone.Comments_Justifications__c='',
                        customMilestone.Reason__c='',
                        customMilestone.Mid_year_SIP_REQ__c=false,
                        this.mutatorMethod(customMilestone);
                        /*if(targetmilestone.length > 7 && targetmilestone[i] == 'Maintain PTOR'){
                            
                        }else if(targetmilestone[i] != 'Maintain PTOR'){
                            this.mutatorMethod(customMilestone);
                        }*/
                        //this.objcmpcount.push(...lstmilestones);
                        //this.prodobjcmpcount.push(...lstmilestones);
                        //lstmilestones.push(customMilestone);
                    }
                }else{
                    for(var i=0; i <targetmilestone.length; i++) {
                        var milestonevalue=targetmilestone[i];
                        let customMilestone={};
                        customMilestone.Milestone__c = milestonevalue;
                        customMilestone.TAMBA_Name__c =rdduplicateTamba[t];
                        customMilestone.Id ='';
                        customMilestone.Application_Name__c ='';
                        customMilestone.Customer_Engagement1__c ='';
                        customMilestone.Target_Date__c='';
                        if((milestonevalue == 'Co-DTOR (with $ PO)' || milestonevalue == 'Sole-DTOR (with $ PO)')){
                            customMilestone.Target_Date__c=this.maptamba[customMilestone.TAMBA_Name__c].DTOR_Date__c;
                        }
                        
                        customMilestone.SIP_Objective_Owned_by_BM__c='';
                        customMilestone.Milestone_Status__c='';
                        customMilestone.Prioritized_TAMBA_FYs__c ='';
                        customMilestone.Additional_Information__c ='';
                        customMilestone.Primary_Reason__c='';
                        customMilestone.Proof__c='';
                        customMilestone.Comments_Justifications__c='',
                        customMilestone.Reason__c='',
                        customMilestone.Mid_year_SIP_REQ__c=false,
                        this.mutatorMethod(customMilestone);
                        /*if(targetmilestone.length > 7 && targetmilestone[i] == 'Maintain PTOR'){
                            
                        }else if(targetmilestone[i] != 'Maintain PTOR'){
                            this.mutatorMethod(customMilestone);
                        }*/
                        //this.objcmpcount.push(...lstmilestones);
                        //this.prodobjcmpcount.push(...lstmilestones);
                        //lstmilestones.push(customMilestone);
                    }
                }
               
            }
        }

    }

    autoPopulateLitechange(event){
        console.log(event.target.checked);
        
        this.autoPopulateLite =event.target.checked;
       /* if(event.target.checked){
            var r = confirm("Are you sure you want to auto populate milestones");
            if (r === false) {
                return;
            }
        }*/

        this.litemilestonecount =this.lstLiteTargetMilestone.length;
        let rdduplicateTamba=this.lstliteduplicateTambaAutomatic;
        console.log(rdduplicateTamba);
        console.log(JSON.stringify(rdduplicateTamba));
        if(rdduplicateTamba.length > 0){
            const targetmilestone=this.lstLiteTargetMilestone;
            //let lstmilestones=[];
            for(var t=0; t <rdduplicateTamba.length; t++) {
                for(var i=0; i <targetmilestone.length; i++) {
                    var milestonevalue=targetmilestone[i];
                    let customMilestone={};
                    customMilestone.Milestone__c = milestonevalue;
                    customMilestone.TAMBA_Name__c =rdduplicateTamba[t];
                    customMilestone.Id ='';
                    customMilestone.Application_Name__c ='';
                    customMilestone.Customer_Engagement1__c ='';
                    customMilestone.Target_Date__c='';
                    if((milestonevalue == 'Co-DTOR (with $ PO)' || milestonevalue == 'Sole-DTOR (with $ PO)')){
                        customMilestone.Target_Date__c=this.maptamba[customMilestone.TAMBA_Name__c].DTOR_Date__c;
                    }
                    if((milestonevalue == 'Maintain PTOR' || milestonevalue == 'Co PTOR (with $ PO)' || milestonevalue == 'Sole-PTOR (with $ PO)')){
                        customMilestone.Target_Date__c=this.maptamba[customMilestone.TAMBA_Name__c].PTOR_Date__c;
                    }
                    
                    customMilestone.SIP_Objective_Owned_by_BM__c='';
                    customMilestone.Milestone_Status__c='';
                    customMilestone.Prioritized_TAMBA_FYs__c ='';
                    customMilestone.Additional_Information__c ='';
                    customMilestone.Primary_Reason__c='';
                    customMilestone.Proof__c='';
                    customMilestone.Comments_Justifications__c='',
                    customMilestone.Reason__c='',
                    customMilestone.Mid_year_SIP_REQ__c=false,
                    this.mutatorMethod(customMilestone);
                    /*if(targetmilestone.length > 7 && targetmilestone[i] == 'Maintain PTOR'){
                        
                    }else if(targetmilestone[i] != 'Maintain PTOR'){
                        this.mutatorMethod(customMilestone);
                    }*/
                    //this.objcmpcount.push(...lstmilestones);
                    //this.prodobjcmpcount.push(...lstmilestones);
                    //lstmilestones.push(customMilestone);
                }
            }
        }

    }

    autoPopulateProdchange(event){
        console.log(event.target.checked);
        this.autoPopulateProd =event.target.checked;
       /* if(event.target.checked){
            var r = confirm("Are you sure you want to auto populate milestones");
            if (r === false) {
                return;
            }
        }*/

        this.prodmilestonecount =this.lstProdTargetMilestone.length;
        let prodduplicateTamba=this.lstprodduplicateTambaAutomatic;
        
        if(prodduplicateTamba.length > 0){
            const targetmilestone=this.lstProdTargetMilestone;
            //let lstmilestones=[];
            for(var t=0; t <prodduplicateTamba.length; t++) {
                for(var i=0; i <targetmilestone.length; i++) {
                    var milestonevalue=targetmilestone[i];
                    let customMilestone={};
                    customMilestone.Milestone__c = milestonevalue;
                    customMilestone.TAMBA_Name__c =prodduplicateTamba[t];
                    customMilestone.Id ='';
                    customMilestone.Application_Name__c ='';
                    customMilestone.Customer_Engagement1__c ='';
                    customMilestone.Target_Date__c='';
                    if((milestonevalue == 'Maintain PTOR' || milestonevalue == 'Co PTOR (with $ PO)' || milestonevalue == 'Sole-PTOR (with $ PO)')){
                        customMilestone.Target_Date__c=this.maptamba[customMilestone.TAMBA_Name__c].PTOR_Date__c;
                    }
                    
                    customMilestone.SIP_Objective_Owned_by_BM__c='';
                    customMilestone.Milestone_Status__c='';
                    customMilestone.Prioritized_TAMBA_FYs__c ='';
                    customMilestone.Additional_Information__c ='';
                    customMilestone.Primary_Reason__c='';
                    customMilestone.Proof__c='';
                    customMilestone.Comments_Justifications__c='',
                    customMilestone.Reason__c='',
                    customMilestone.Mid_year_SIP_REQ__c=false,
                    this.mutatorprodMethod(customMilestone);
                    //this.objcmpcount.push(...lstmilestones);
                    //this.prodobjcmpcount.push(...lstmilestones);
                    //lstmilestones.push(customMilestone);
                }
            }
        }

    }

    handleError(event){
        var error=event.detail;
        console.log('error Message:'+error);
        this.errorMessage =error;
        this.hasErrors =true;
        if(error == 'Milestone Objective Details/SIP Justification should not be null'){
        const hasnotambaerror = new CustomEvent("haserror", {
            detail : {hasnotambaerror : true}
        });
        this.dispatchEvent(hasnotambaerror);
        }else{
            const hasnotambaerror = new CustomEvent("haserror", {
                detail : {hasnotambaerror : false}
            });
            this.dispatchEvent(hasnotambaerror);
        }
    }

    @track recordPageUrl;
    save(){
        //console.log(this.dynamiccmpcount);
        console.log('::Save Start::');
        if(this.recordId === null)
        {
            return;
        }
        console.log('::Save Start::');
        const parentRecord =this.recordId;//;
        console.log(parentRecord);
        if(this.hasErrors){
            /*const evt = new ShowToastEvent({
                title: 'Error',
                message: this.errorMessage,
                variant: 'error',
            });
            this.dispatchEvent(evt);*/
            alert(this.errorMessage);
            this.hasErrors =false;
            const nextTab = new CustomEvent("save", {
                detail : {tabName : '1' , isparent : false}
            });
            this.dispatchEvent(nextTab);
            return;
        }
        
        
        // if(this.hasErrors){
        //     /*const evt = new ShowToastEvent({
        //         title: 'Error',
        //         message: this.errorMessage,
        //         variant: 'error',
        //     });
        //     this.dispatchEvent(evt);*/
        //     alert(this.errorMessage);
        //     this.hasErrors =false;
        //     const nextTab = new CustomEvent("save", {
        //         detail : {tabName : '1' , isparent : false}
        //     });
        //     this.dispatchEvent(nextTab);
        //     return;
        // }

        console.log(this.objcmpcount);
        const type=(this.type ==='Production'?'Production':'R&D');
        let typelocal = '';
        if(this.type =='RD' || this.type =='Lite')
        typelocal = 'RD';
        else if(this.type =='Production')
        typelocal = 'Production';

        console.log(typelocal);
        const objName ='Milestone__c';
        const parentApiName ="SOO__c";
            
        saveData({ objdata :(typelocal ==='Production'?JSON.stringify(this.prodobjcmpcount):JSON.stringify(this.objcmpcount)),parentRecord, type,objName,parentApiName}) //
            .then(result => {
                console.log(result);
                //console.log(this.parentRecord);
                if(result.startsWith('Error')){
                    /*const evt = new ShowToastEvent({
                        title: 'Error',
                        message: result,
                        variant: 'error',
                    });
                    this.dispatchEvent(evt);*/
                    alert(result);
                    const nextTab = new CustomEvent("save", {
                        detail : {tabName : '1' , isparent : false}
                    });
                    this.dispatchEvent(nextTab);

                    const nextTabforLite = new CustomEvent("savelite", {
                        detail : {tabName : 'two' , isparent : false}
                    });
                    this.dispatchEvent(nextTabforLite);
                }else{
                    const nextTab = new CustomEvent("save", {
                        detail : {tabName : '2' , isparent : false}
                    });
                    this.dispatchEvent(nextTab);

                    const nextTabforLite = new CustomEvent("savelite", {
                        detail : {tabName : 'three' , isparent : false}
                    });
                    this.dispatchEvent(nextTabforLite);
                    // Dispatches the event.
                    console.log("refresh");    
                    //return refreshApex(this.objcmpcount,this.prodobjcmpcount); //this.findSomething
                }
            })
            .catch(error => {
                this.error = error;
                this.objectFields = undefined;
            });
        console.log('::Save End::');
    }
}