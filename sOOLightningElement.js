/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
import { LightningElement,track,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class SOOLightningElement extends LightningElement {

    @track objcmpcount=[];
    @track prodobjcmpcount=[];
    @api recordId;
    @api type;
    @track isRd=false;
    @track isProd=false;

    @track obj;
    @track prodobj;

    @api
    createRDRecord(){
        this.mutatorMethod('');
        console.log(this.objcmpcount.length);
    }

    @api
    createProdRecord(){
        this.mutatorprodMethod('');
    }

    @api
    saveRecords(){
        this.template.querySelector('.submitButton').click();
    }

    @api
    mutatorMethod(data) {
        //use spread operator (immutable data structure, do not use .push() )
        let r = Math.random().toString(36).substring(7);
        console.log(data!== '');
        this.objcmpcount = [
            ...this.objcmpcount,
            {
                label:  r,   //maybe use index?
                value: data!== ''?data:this.obj
            }
        ];
    }

    @api
    mutatorLiteMethod(data) {
        //use spread operator (immutable data structure, do not use .push() )
        let r = Math.random().toString(36).substring(7);
        console.log(data!== '');
        this.objcmpcount = [
            ...this.objcmpcount,
            {
                label:  r,   //maybe use index?
                value: data!== ''?data:this.obj
            }
        ];
    }

    @api
    mutatorprodMethod(data) {
        //use spread operator (immutable data structure, do not use .push() )
        let r = Math.random().toString(36).substring(7);
        console.log(data!== '');
        console.log('mutatorProdMethod:::'+data);
        this.prodobjcmpcount = [
            ...this.prodobjcmpcount,
            {
                label:  r,   //maybe use index?
                value: data!== ''?data:this.prodobj
            }
        ];
    }

    

    @api
    handledeletedvalue(event){
        console.log(event);
        console.log('Parent: handledeletedvalue::::'+event.detail);
        console.log(event.detail);
        for(var j=0; j < this.objcmpcount.length; j++) {
            if(this.objcmpcount[j].label === event.detail)
            {
                this.objcmpcount.splice(j,1);
            }
        }
        
    }

    @api
    handleProddeletedvalue(event){
        console.log('Parent: handleProddeletedvalue::::'+event.detail);
        for(var i=0; i < this.prodobjcmpcount.length; i++) {
            if(this.prodobjcmpcount[i].label === event.detail)
            {
                this.prodobjcmpcount.splice(i,1);
            }
         }
    }

    @api
    handlerProdValueChange(event){
        var childrecords=event.detail;
        console.log(childrecords);
        var response=[];
        if(childrecords.tabname == 'areaofstrength'){
            response=childrecords.detail.split('!@#$%^&*()');
        }else{
        response=event.detail.split('--');
        }
        console.log(response);
        const rowDeleted=false;
        for(var i=0; i < this.prodobjcmpcount.length; i++) {
            if(this.prodobjcmpcount[i].label === response[0])
            {
                this.prodobjcmpcount.splice(i,1);
                this.rowDeleted =true;
            }
         }
         if(this.rowDeleted){
            if(response[1] !== '"Delete"'){
                this.prodobjcmpcount = [
                    ...this.prodobjcmpcount,
                    {
                        label:  response[0],   //maybe use index?
                        value: response[1]
                    }
                ];
            }
            console.log('this.prodobjcmpcount----->'+this.prodobjcmpcount);
         }
    }

    @api
    handlerValueChange(event){
        var childrecords=event.detail;
        console.log(childrecords);
       // console.log(childrecords.includes('||'));
        var response=[];
        if(childrecords.tabname == 'areaofstrength'){
            response=childrecords.detail.split('!@#$%^&*()');
        }else{
            if(childrecords.includes('||')){
                response=event.detail.split('||');
            }else{
                response=event.detail.split('--');
            }
        }
        
        const rowDeleted=false;
        for(var i=0; i < this.objcmpcount.length; i++) {
            if(this.objcmpcount[i].label === response[0])
            {
                this.objcmpcount.splice(i,1);
                this.rowDeleted =true;
            }
         }
         if(this.rowDeleted){
            if(response[1] !== '"Delete"'){
                this.objcmpcount = [
                    ...this.objcmpcount,
                    {
                        label:  response[0],   //maybe use index?
                        value: response[1]
                    }
                ];
            }
         }

    }
}