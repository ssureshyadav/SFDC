/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable no-const-assign */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
import { LightningElement, track, api, wire } from "lwc";

//import saveData from '@salesforce/apex/SOOLWC.save';
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getUserInfo from '@salesforce/apex/SOOLWCEdit.getUserInfo';
import getParentFabs from '@salesforce/apex/SOOLWCEdit.getParentFabs';
import accountName from '@salesforce/apex/SOOLWCEdit.accountName';
import userId from '@salesforce/user/Id';
import loadPSCFromTambaId from '@salesforce/apex/SOOLWCEdit.loadPSCFromTambaId';
import loadPrimaryTamba from '@salesforce/apex/SOOLWCEdit.loadPrimaryTamba';
import fetchAMATEmployee from '@salesforce/apex/SOOLWCEdit.fetchAMATEmployee';
import deleteSooCloneRecord from '@salesforce/apex/SOOLightningController.deleteCloneRecord';
import TextAreaHeight from '@salesforce/resourceUrl/TextAreaHeight';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

export default class SOOEdit extends NavigationMixin(LightningElement) {
	@api recordId;
	@api isclone =false;
	@track cloneChanged =false;
	@track sooId;
	@track displaySave = false;
	@track isUpdate = false;
	@track hasPSC = false;
	@track pscId;
	@track tambaselected = [];
	@track userId = userId;
	@track hasError=false;
	@track sooName;
	@track AccountId;
	@track parentFabOptions = [];
	@track _parentFabsselected = [];
	@track selectedValues = [];

	@track activeTab = "1";
	@track activeTabTopLevel = "1";
	@track opportunityId;

	@track deviceType;
	@track CustomerNode;
	@track ApplicationName;
	@track AMATProduct;
	@track CompetitorCompany;
	@track CompetitorProduct;
	@track revenue;

	@track developmentStartDate;
	@track developmentEndDate;
	@track pilotStartDate;
	@track pilotEndDate;
	@track HVMStartDate;
	@track HVMEndDate;
	@track salespersonId;
	@track bmPersonId;
	@track teamMember1;
	@track teamMember4;

	@track ptorDate;
	@track dtorDate;
	@track CustomerEngagement; 
	@track TotalOpportunityTagged;

	@track hasAccess =true;
	@track isCTOUSER=false;
	@track displayreason =false;
	@track showtambatagging=true;
	@track display4a=false;
	@track display4b=false;
	@track showSpinner=false;
	@track SOOIdField;

	@wire(getUserInfo, { userId: userId }) 
	userData({error,data}) {
		if (error) {
			this.error = error ; 
		} else if (data) {
			/*if(data.Profile.Name ==='Senior PSEs'){
				this.hasAccess =false;
			}else*/ 
			if(data.Profile.Name ==="Corp CTO User"){
				this.isCTOUSER =true;
			}
		}
	}


	connectedCallback() {

		//this.recordId = "a076C000001KCq9QAG";
		loadStyle(this, TextAreaHeight);
		console.log(this.recordId);
		console.log(this.listWrapper);
		this.SOOIdField = '';
		this.showSpinner =true;
		//
		if (this.recordId != null) {
			
			this.activeTabTopLevel = "1";
			this.isUpdate = true;
			this.displaySave = true;
			loadPrimaryTamba({'recordId':this.recordId})
			.then(response => {
				//this.deviceType=result.Primary_Product_Scorecard__r.Name;
				this.SOOIdField = response.SOOIdField;
				this.AccountId = response.AccountIdField;
				console.log('response.ParentFabs--->'+JSON.stringify(response));
				if(response.ParentFabs != null){
					const myArray = response.ParentFabs.split(",");
					for(var i=0;i<myArray.length;i++){
						this._parentFabsselected.push(...[myArray[i]]);
					}
				}
			if(response != null && response.tambaRec != null){
				const result =response.tambaRec;
				var lstcustomerRoadMap=response.lstRoadMap;
				if(result.Device_Type__c != null){
					this.deviceType =result.Device_Type__r.Name;
				}
				this.CustomerEngagement =result.Customer_Engagement__c;
				if(result.SSG_Opportunities__r != null){
					console.log('::SSG Opportuinties::'+result.SSG_Opportunities__r.length);
					if(result.SSG_Opportunities__r.length >0){
						//console.log('SSG :::'+result.SSG_Opportunities__r[0].Opportunity_ID__c);
						this.opportunityId=result.SSG_Opportunities__r[0].Opportunity_ID__c;
					}
				}

				if(result.Customer_Node__c != null){
					this.CustomerNode =result.Customer_Node__r.Name;
				}

				if(result.Application_Name_Customer__c != null){
					this.ApplicationName =result.Application_Name_Customer__r.Name;
				}

				if(result.Product_Scorecard__c != null){
					this.pscId =result.Product_Scorecard__c;
					this.hasPSC =true;
				}

				this.dtorDate =result.DTOR_Date__c;
				this.ptorDate =result.PTOR_Date__c;

				if(result.AMAT_Product_G3__c != null){
					this.AMATProduct =result.AMAT_Product_G3__r.Name;
				}

				/*if(result.AMAT_Product_G3__c != null){
					this.AMATProduct =result.AMAT_Product_G3__r.Name;
				}

				if(result.AMAT_Product_G3__c != null){
					this.AMATProduct =result.AMAT_Product_G3__r.Name;
				}

				if(result.AMAT_Product_G3__c != null){
					this.AMATProduct =result.AMAT_Product_G3__r.Name;
				}*/

				if(result.Competitor_Company__c != null){
					this.CompetitorCompany =result.Competitor_Company__r.Name;
				}
				
				if(result.Competitor_Tool__c != null){
					this.CompetitorProduct =result.Competitor_Tool__r.Name;
				}


				for(var i=0;i<lstcustomerRoadMap.length;i++){
					if(lstcustomerRoadMap[i].Stage__c == 'Development'){
						this.developmentStartDate =lstcustomerRoadMap[i].Start_Date__c;
						this.developmentEndDate=lstcustomerRoadMap[i].End_Date__c;
					}else if(lstcustomerRoadMap[i].Stage__c == 'Pilot'){
						this.pilotStartDate =lstcustomerRoadMap[i].Start_Date__c;
						this.pilotEndDate =lstcustomerRoadMap[i].End_Date__c;
					}else if(lstcustomerRoadMap[i].Stage__c == 'High Volume Manufacturing'){
						this.HVMStartDate =lstcustomerRoadMap[i].Start_Date__c;
						this.HVMEndDate =lstcustomerRoadMap[i].End_Date__c;       
					}
				}
				this.revenue =response.totalRevenue;
				this.showSpinner =false;
			}else{
				this.showSpinner =false;
			}
			})
		}else{
			this.showSpinner =false;
		}
		
	}

	handleSOOName(event){
		const account = this.template.querySelector('[data-id="accountInfo"]');
		const businessUnit = this.template.querySelector('[data-id="businessUnit"]');
		accountName({'accId':account.value})
			.then(result => {
			this.sooName =result+ " Fab X " + (businessUnit.value != null?businessUnit.value:'');
			//console.log('SOO Name::'+this.sooName);
			})
			if(account.value!= null){
				this.AccountId = account.value;
				getParentFabs({'AccountId':account.value})
				.then(result => {
					if(result != null){
						this.parentFabOptions = [];
						for(let i=0;i<result.length;i++){
							this.parentFabOptions.push({
								label: result[i],
								value: result[i]
							})
							
						}
					}
					

				})
			}
	}

	handleParentFabChange(e) {
        this._parentFabsselected = e.detail.value;
		console.log('this._parentFabsselected-->'+this._parentFabsselected);
    }

	handleSegmentchange(event){
		console.log(event.target.value);
		const segmentvalue=event.target.value;
		this.handlepickistchanges(segmentvalue);
	}

	handlepickistchanges(data){
		if(data === 'AGS'){
			this.display4a =true;
			this.display4b =true;
			this.showtambatagging =false;
		}else if((data === "Corp CTO" || data === "FCL") && this.isCTOUSER) //&& programName == "FCL"
		{
			this.display4a =true;
			this.display4b =false;
			this.showtambatagging =false;
		}else{
			this.display4a =false;
			this.display4b =false;
			this.showtambatagging =true;
		}
	}
@track tambaRecId = '';
@track tambaRecName = '';
@track pscRecId = '';
@track pscRecName = '';
@track bubmonload = false;
	handleLoad(event){
		//var recUi = event.getParam("recordUi");
		//console.log(recUi.record.id);
		//console.log('fields--->'+JSON.stringify(event.detail.objectInfos.SOO__c.fields)); // gives label, name and many other properties of fields
    	//console.log('fields Values--->'+JSON.stringify(event.detail.records[this.recordId].fields)); // gives values of fields against field name
		//console.log('TAMBA Value--->'+event.detail.records[this.recordId].fields.Primary_Product_Scorecard__c.value);
		if(this.recordId != null){
		if(event.detail.records[this.recordId].fields.TAMBA__c != undefined){
		if(event.detail.records[this.recordId].fields.TAMBA__c.value != null){
		this.tambaRecId = '/'+event.detail.records[this.recordId].fields.TAMBA__c.value;
		this.tambaRecName = event.detail.records[this.recordId].fields.TAMBA__r.displayValue;
		}
	}
		if(event.detail.records[this.recordId].fields.PrimaryProductScorecard__c != undefined){
		if(event.detail.records[this.recordId].fields.PrimaryProductScorecard__c.value != null){
			this.pscRecId = event.detail.records[this.recordId].fields.PrimaryProductScorecard__c.value;
			this.pscRecName = event.detail.records[this.recordId].fields.PrimaryProductScorecard__c.value;
		}
	}
}
		const inputFields = this.template.querySelectorAll('lightning-input-field');
		if (inputFields) {
			inputFields.forEach(field => {
				//.fieldName + '--'+field.target.value
				if(field.fieldName ==='Name'){ //&& field.value.startsWith('a07')
					//field.value='';
					
				}
				if(field.fieldName ==='Segment__c' && (field.value ==='AGS' || field.value ==='Corp CTO')){
					this.handlepickistchanges(field.value);
				}/*else if(field.fieldName ==='Primary_Product_Scorecard__c' && field.value != null){
					this.pscId=field.value;
					this.hasPSC =true;
				}*/else if(field.fieldName ==='SOOClone__c' && field.value === true && !this.cloneChanged){
					this.isclone =true;
					console.log('clone Called Once');
					console.log(this.cloneChanged);
					this.sooName ='';
				}

				if(field.fieldName ==='Sales_Person__c'){ //&& field.value ===''
					//console.log('Sales_Person__c::'+field.value);
					if(field.value== null){
						field.value=this.userId;
					}
					this.salespersonId = field.value;
				}

				if(field.fieldName === 'Account__c'){
					if(field.value!= null){
						this.AccountId = field.value;
						getParentFabs({'AccountId':field.value})
						.then(result => {
							if(result != null){
								this.parentFabOptions = [];
								for(let i=0;i<result.length;i++){
									this.parentFabOptions.push({
										label: result[i],
										value: result[i]
									})
									
								}
								console.log('this.parentFabOptions--->'+JSON.stringify(this.parentFabOptions));
								
							}
							

						})
					}
				}

				if(field.fieldName ==='BM_Person__c' && field.value != null){ 
					this.bmPersonId =field.value;
				}else{
					this.bubmonload = true;
				}

				if(field.fieldName ==='Team_Member_1__c' && field.value != null){ 
					this.teamMember1 =field.value;
				}

				if(field.fieldName ==='Team_Member_4__c' && field.value != null){ 
					this.teamMember4 =field.value;
				}
			});
		}
		if(this.teamMember1 == null){
			console.log('teamMember1:'+this.teamMember1);
			console.log('salespersonId:'+this.salespersonId);
			fetchAMATEmployee({'recordid':this.salespersonId})
				.then(response => {
					console.log(response);
					this.teamMember1 =response.Id;
					console.log('teamMember1:'+this.teamMember1);
			});
			
		}
		
		if(this.teamMember4 == null && this.bmPersonId != null){
			console.log('bmPersonId:'+this.bmPersonId);
			fetchAMATEmployee({'recordid':this.bmPersonId})
				.then(response => {
					this.teamMember4 =response.Id;
			});
		}
		
	}
	handledatachange(event){
		console.log(event.target.fieldName);
		console.log(event.target.value);
		const segmentvalue=event.target.value;
    	
	}
	handleSubmit(event) {
		event.preventDefault(); // stop form submission
		console.log('onsubmit: '+ event.detail.fields);
		const fields = event.detail.fields;
		fields.SOOClone__c = false;
		fields.SOO_Team_Category_1__c ='Sales';
		fields.SOO_Team_Category_2__c ='Sales';
		fields.SOO_Team_Category_3__c ='Sales';
		fields.SOO_Team_Category_4__c='BM';
		fields.SOO_Team_Category_5__c='BM';
		fields.SOO_Team_Category_6__c='PSE';
		fields.SOO_Team_Category_7__c='PSE';
		fields.SOO_Team_Category_8__c='GPM';
		fields.SOO_Team_Category_9__c ='CAT';
		console.log('this._parentFabsselected--->'+this._parentFabsselected);
		//console.log('selectedValues---->'+this.selectedValues);
		let AppendselectedValues = '';
		if(this._parentFabsselected != null){
			for(let i=0;i<this._parentFabsselected.length;i++){
				AppendselectedValues+=this._parentFabsselected[i]+','
			}
			fields.Parent_Fab__c = AppendselectedValues.replace(/,\s*$/, "");
		}

		fields.SOOBackgroundCompletion__c =false;
		if(fields.Parent_Fab__c != null){
			fields.SOOBackgroundCompletion__c =true;
		}
		//fields.SOOCorporateTaggingCompletion__c =true;

		fields.SOOTeamMembersCompletion__c =false;
		if(((fields.Team_Member_6__c != null && fields.Team_Member_6__c != '')
			&& fields.Team_Member_8__c != null && fields.Team_Member_8__c != '')){
			fields.SOOTeamMembersCompletion__c =true;
		}
		
		// fields.SOOSingleSalesObjectiveCompletion__c =false;
		// if(fields.Fab_Name__c != null && fields.Fab_Name__c != '' 
		// 	&& fields.TAMBA__c != null && fields.TAMBA__c !=''){
		// 	fields.SOOSingleSalesObjectiveCompletion__c=true;
		// }
		
		// fields.SOOPrimaryCompetitorCompletion__c=false;
		// if(fields.Competitor_Product_Price__c != null && fields.Competitor_Product_Price__c != ''
		// 	&& fields.Bundle_Offer__c != null && fields.Bundle_Offer__c != ''
		// 	&& fields.Competitor_Product_Installation_Status__c != null && fields.Competitor_Product_Installation_Status__c != ''
		// 	){ //&& fields.Additional_Competitor_Information__c != null && fields.Additional_Competitor_Information__c != ''
		// 		if(fields.TAMBA__c != null)
		// 		fields.SOOPrimaryCompetitorCompletion__c=true;
		// } 

		//fields.SOOEventCalendarCompletion__c=false;
		/*if(this.developmentStartDate != null && this.developmentEndDate !=null && this.pilotStartDate != null
		&& this.pilotEndDate != null && this.HVMStartDate != null && this.HVMEndDate != null && this.dtorDate != null && this.ptorDate != null 
		&& fields.Device_Qualification__c!= null && fields.Device_Qualification__c!= ''
		&& fields.Demo__c != null && fields.Demo__c != ''
		&& fields.Onsite_Eval_Start_Date__c != null && fields.Onsite_Eval_Start_Date__c != '' 
		&& fields.Onsite_Eval_End_Date__c != null && fields.Onsite_Eval_End_Date__c != '' 
		&& fields.Eval_Signoff__c != null && fields.Eval_Signoff__c != ''){
			fields.SOOEventCalendarCompletion__c =true;
		}*/
		// if(fields.Device_Qualification__c!= null && fields.Device_Qualification__c!= '' && this.dtorDate != null && this.ptorDate != null ){
		// 	fields.SOOEventCalendarCompletion__c =true;
		// }

		if(fields.BM_Person__c == null || fields.BM_Person__c == '' || fields.BM_Person__c == undefined){
			this.hasError=true;
		}
		
		//fields.OwnerId =this.userId;
		this.isclone =false;
		this.cloneChanged =true;
		console.log(JSON.stringify(fields));
		this.template.querySelector('lightning-record-edit-form').submit(fields);
		console.log(this.isclone);
	}

	handleActive(event){
		console.log('handleActive::'+event.target.value);
		this.activeTab =event.target.value;
		/*if(event.target.value === '5'){
			var thingToRemove =this.template.querySelectorAll("c-sootasks")[0];
			if(thingToRemove !== undefined){
				console.log('thingToRemove::'+thingToRemove);
				thingToRemove.parentNode.removeChild(thingToRemove);
			}
		}*/
	}

	handleParentActive(event){
		this.activeTabTopLevel =event.target.value;
		console.log(this.isSOOTab);
	}

	handleTambaselected(event) {
		//console.log(event.detail);
		console.log(event.detail);
		this.tambaselected = event.detail;
		console.log('this.tambaselected--->'+this.tambaselected);
		let milestones=this.template.querySelector("c-soomilestones");
        console.log('milestones:::'+milestones);
        if(milestones != null){
            this.template.querySelectorAll("c-soomilestones").forEach(element => {
				element.addTamba(event.detail);
			});
        }
		//console.log(this.template.querySelector('c-soo-milestone'));
		//this.template.querySelector("c-soomilestones").addTamba(event.detail);
	}

	/*handleSoo(event){
	console.log('handleSoo');
	const fields = event.detail.fields;
	console.log(JSON.stringify(fields));
	}*/

	handleSuccess(event) {
		this.showSpinner =true;
		this.sooId = event.detail.id;
		this.recordId = event.detail.id;
		
		this.activeTabTopLevel = "2";
		console.log('handleSuccess::'+this.display4a);
		if(this.display4a){
			this.activeTabTopLevel = "4";
		}
		this.displaySave = true;
		this.isUpdate = true;
		this.dispatchEvent(
			new ShowToastEvent({
				title: "Success",
				message: "SOO Changes has been updated",
				variant: "success"
				})
		);
		this.showSpinner =false;
	}

	handleError(event){
		this.hasError = true;
		console.log('Error Message::'+ event.detail.detail);
		console.log(JSON.stringify(event));
		const message =event.detail.message;
		const errors=event.detail.output.errors;
		var error='';
		if(errors.length >0){
			error =errors[0];
			const errorCode =error.errorCode;
			const errorMessage =error.message;
			const demo = new ShowToastEvent({
				"variant": "error",
				"mode" : "sticky",
				"message": errorCode  + ''+message +''+errorMessage,
			});
			this.dispatchEvent(demo);
		}
	}

	hanldestatusChange(event){
		console.log(event.detail);
		console.log(event.detail.value);
		/*if(event.detail.value ==='Lost'){
			this.displayreason =true;
		}else{
			this.displayreason =false;
		}*/
	}

	hanldeBMChange(event){
		console.log(event.detail);
		console.log(event.detail.value[0]);
		console.log(JSON.stringify(event.detail.value));
		console.log(JSON.stringify(event.detail.value));
		console.log(this.teamMember4);
		if(JSON.stringify(event.detail.value) != '[]'){
			this.hasnotambaerror = false;
			if(this.teamMember4 == null && event.detail.value != ''){
				console.log(typeof event.detail.value);	
				if(typeof event.detail.value == 'object'){
					this.bmPersonId =event.detail.value[0];	
				}else{
					this.bmPersonId =event.detail.value;
				}
				fetchAMATEmployee({'recordid' : this.bmPersonId})
					.then(response => {
						this.teamMember4 =response.Id;
						console.log(this.teamMember4);
				});
			}
		}else{
			this.hasnotambaerror = true;
		}
		
		/*if(event.detail.value ==='Lost'){
			this.displayreason =true;
		}else{
			this.displayreason =false;
		}*/
	}

	handleSave(event) {
		console.log('handleSave');
		
		//console.log(event.detail.tabName);
		//console.log(event.detail.objName);
		/*if(event.detail.objName === 'milestone'){
		//this.template.querySelector("c-soomilestones").classList.add("hidden");
		//this.template.querySelector("c-soomilestones").remove();
		}*/
		
		this.showSpinner =false;
		this.hasError =false;
		console.log(event.detail.isparent);
		if(event.detail.isparent){
			console.log(event.detail.tabName);
			this.activeTabTopLevel = event.detail.tabName;
			if(event.detail.tabName ==="3"){
				
				console.log('this.recordId::'+this.recordId);
				if(this.recordId != ''){
					loadPSCFromTambaId({'recordId':this.recordId})
						.then(response => {
							console.log('loadPSCFromTambaId Response:'+response);
							if(response != null){
								// this.hasPSC=true;
								// this.pscId=response;
								this.activeTabTopLevel="4";
								this.hasPSC=false;
							}else{
								this.activeTabTopLevel="4";
								this.hasPSC=false;
							}
							console.log('active Tab:'+this.activeTabTopLevel);
							this.activeTab ="1";
					});
				}
			}
			this.activeTab ="1";
		}else{
			if(this.activeTab == event.detail.tabName){
				this.hasError=true;
			}
			this.activeTab =event.detail.tabName;
		}
		
		//this.activeTabTopLevel = event.detail.tabName;
		//this.activeTab ="1";
	}

	get isEVAProdTab(){
		return (this.activeTabTopLevel === '5' &&  this.activeTab === '8')?true:false;
	}

	savemodal(){
		console.log('---->this.hasnotambaerror---'+ this.hasnotambaerror);
		
		console.log('savemodal');
		console.log(this.activeTabTopLevel);
		console.log(this.activeTab);
		this.showSpinner =true;
		if(this.activeTabTopLevel === '1'){
			this.showSpinner =false;
			this.template.querySelector('.submitButton').click();	
		}else if(this.activeTabTopLevel === '2'){			
			this.template.querySelector("c-sootagging").saveRecords();
		}else if(this.activeTabTopLevel === '3'){
			this.template.querySelector("c-sooproductscorecard").saveRecords();
		}else if(this.activeTabTopLevel === '4'){
			if(this.activeTab === '1'){
				this.template.querySelector("c-soomilestones").saveRecords();
			}else if(this.activeTab === '2'){
				this.template.querySelector("c-soodecisionmakers").saveRecords();
				this.template.querySelector("c-soodecisionmakertasks").saveRecords();
			}else if(this.activeTab === '3'){
				this.template.querySelector("c-soohvps").saveRecords();
			}else if(this.activeTab === '4'){
				this.template.querySelector("c-sooareastrength").saveRecords();
			}else if(this.activeTab === '5'){
				this.template.querySelector("c-sooredflagstrategy").saveRecords();
			}else if(this.activeTab === '6'){
				this.template.querySelector("c-sootasks").saveRecords();
			}else if(this.activeTab === '7'){
				this.template.querySelector("c-sooexecutivehelp").saveRecords();
			}else if(this.activeTab === '8'){
				this.template.querySelector("c-sooeconomicvalue").saveRecords();
			}
		}else if(this.activeTabTopLevel === '5'){
			if(this.activeTab === '1'){
				this.template.querySelectorAll("c-soomilestones").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();
						this.showSpinner =false;
					}
				});
				
			}else if(this.activeTab === '2'){
				this.template.querySelectorAll("c-soodecisionmakers").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
				this.template.querySelectorAll("c-soodecisionmakertasks").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
			}else if(this.activeTab === '3'){
				this.template.querySelectorAll("c-soohvps").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
			}else if(this.activeTab === '4'){
				this.template.querySelectorAll("c-sooareastrength").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();
					}
				});
			}else if(this.activeTab === '5'){
				this.template.querySelectorAll("c-sooredflagstrategy").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
			}else if(this.activeTab === '6'){
				this.template.querySelectorAll("c-sootasks").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
			}else if(this.activeTab === '7'){
				this.template.querySelectorAll("c-sooexecutivehelp").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
			}else if(this.activeTab === '8'){
				this.template.querySelectorAll("c-sooeconomicvalue").forEach(element => {
					if(element.type ==='Production'){
						element.saveRecords();}
					});
			}
		}
	
	}
	@api hasnotambaerror = false;
	handlenotambaerror(event){
		console.log('entered----->')
		this.hasnotambaerror = event.detail.hasnotambaerror;
	}
	completemodal(){
		if(this.bmPersonId == null){
			const demo = new ShowToastEvent({
				"variant": "error",
				"mode" : "dismissible",
				"message": "Please fill the BU BM field.",
			});
			this.dispatchEvent(demo);
		}
					
		console.log('---->this.hasnotambaerror---'+ this.hasnotambaerror);
		if(!this.hasnotambaerror && this.bmPersonId != null){
			// var r = confirm("Are you sure you want to close!");
			// if (r === false) {
			// 	return;
			// }
			this.hasError =false;
			this.savemodal();
			setTimeout(() => {
				this.isclone=false;
				/*this.template.querySelector('lightning-record-edit-form').submit();
				this.template.querySelector('lightning-record-edit-form').submit(fields);*/
				//this.template.querySelector('.submitButton').click();
				
				console.log(this.hasError);
				console.log(this.errorMessage);
				if(!this.hasError){
					this.closeModal();
				}
			}, 1000);
		}
	}

	cancelmodal(){
		var r = confirm("Are you sure you want to cancel!");
		if (r === false) {
			return;
		}
		if(this.isclone){
			console.log(this.recordId);
			deleteSooCloneRecord({'recordId':this.recordId})
			.then(result => {
				console.log(result);
				if(result){
					this.closeModal();  
				}
			})
		}else{ 
			this.closeModal();  
		}
		//
	}

	closeModal() {
		console.log("close modal");
		/*this[NavigationMixin.Navigate]({
			type: "standard__objectPage",
			attributes: {
			objectApiName: "SOO__c",
			actionName: "home"
			}
		});*/
		console.log(this.recordId);
		console.log(this.isclone);
		if (this.recordId != null && !this.isclone) {
			console.log('Navigate to detail:');
				this[NavigationMixin.Navigate]({
					type: "standard__recordPage",
					attributes: {
						recordId: this.recordId,
						objectApiName: "SOO__c",
						actionName: "view"
					}
				});	
		}else{
			this[NavigationMixin.Navigate]({
				type: "standard__objectPage",
				attributes: {
				objectApiName: "SOO__c",
				actionName: "home"
				}
			});
			
		}

		window.setTimeout(function(){ 
			window.location.reload();
		}, 1000);

		
	}
}