import { Component, ElementRef, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { GetProfileService } from './services/get-profile.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  //Decurator
  selector: 'app-root', //Đồng nghĩa với document.querySelector('approot'); Angular chỉ cho xài element tag thôi
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
//Từ "selector .... styleUrls": Metadata
export class AppComponent {
  pageGetProfile: any;
  profileUser: any;
  linkProfile: any;
  profilePicUrl: any;
  fullName: any;
  studyAt: any;
  city: any;
  country: any;
  skills: any;
  experiences: any;
  educations: any;
  constructor(private getPfSv: GetProfileService) {}

  @ViewChild('cvInfo', { static: false }) el!: ElementRef;

  onChangeInputProfileLink() {}

  async buildCVPDF() {
    if (this.linkProfile && this.pageGetProfile) {
      if (this.pageGetProfile == 'linkedin') {
        this.getPfSv
          .getProfileLinkedIn(await this.linkProfile)
          .subscribe((res) => {
            if (res) {
              alert('Build CV successfully');
              this.profileUser = res;
              this.profilePicUrl = this.profileUser.profile_pic_url;
              this.fullName = this.profileUser.full_name;
              this.studyAt = this.profileUser.occupation;
              this.city = this.profileUser.city;
              this.country = this.profileUser.country_full_name;
              for(let i = 0; i < this.profileUser.experiences.length; i++) {
                let experience = {
                  company: this.profileUser.experiences[i].company,
                  position: this.profileUser.experiences[i].title
                }
                this.experiences.push(experience);
              }
              for(let i = 0; i < this.profileUser.education.length; i++) {
                let education = {
                  school: this.profileUser.education[i].school,
                  fieldOfStudy: this.profileUser.education[i].field_of_study
                }
                this.educations.push(education);
              }
              for(let i = 0; i < this.profileUser.skills.length; i++) {
                let skill = {
                  name: this.profileUser.skills[i]
                }
                this.skills.push(skill);
              }
            }
          });
      } else if (this.pageGetProfile == 'orcid') {
        var splitted = this.linkProfile.split('/');
        var IdORCID = splitted[splitted.length - 1];

        //test: https://orcid.org/0009-0007-1859-8716
        this.getPfSv.getProfileORCID(await IdORCID).subscribe(
          (res) => {
            console.log(res);
            // const employmentSummaries =
            //   res['activities-summary'].educations['affiliation-group'][0]
            //     .summaries[0]['education-summary'].organization.name;
            // console.log(employmentSummaries);

            if (res) {
              alert('Build CV successfully');
              this.profileUser = res;
              this.fullName =
                this.profileUser.person.name['family-name'].value +
                this.profileUser.person.name['given-names'].value;
              //   this.studyAt = this.profileUser.occupation;
              //   this.city = this.profileUser.city;
              this.country =
                this.profileUser.person.addresses.address[0].country.value;
              this.experiences =
                this.profileUser['activities-summary'].employments[
                  'affiliation-group'
                ][0].summaries[0]['employment-summary'].organization.name;
              this.educations =
                this.profileUser['activities-summary'].educations[
                  'affiliation-group'
                ][0].summaries[0]['education-summary'].organization.name;

              console.log(this.educations);
            }
          },
          (err) => {
            console.log('Error:', err);
          }
        );
      }
      // else {
      //     //Viết code ở đây
      // }

      //this.getPfSv.getProfileLinkedIn1(this.linkProfile);
    } else {
      alert('Vui lòng nhập link profile');
    }
  }

  downloadCVPDF() {
    if (this.profileUser) {
      html2canvas(this.el.nativeElement).then((canvas) => {
        const contentDataUrl = canvas.toDataURL('image/png');
        let pdf = new jsPDF('p', 'mm', 'a4');
        var width = pdf.internal.pageSize.getWidth();
        var height = (canvas.height * width) / canvas.width;
        pdf.addImage(contentDataUrl, 'PNG', 0, 0, width, height);
        pdf.save('cv.pdf');
      });
    } else {
      alert('Không tim thấy dữ liệu');
    }
  }
}
