export class AppUrls {
  public static welcomeUrl = 'welcome';
  public static aboutUrl = 'about';
  public static faqUrl = 'faq';
  public static metadataUrl = 'metadata';
  public static usersUrl = 'users';
  public static studyUrl = 'study/:id';
  public static peopleUrl = 'people';

  // bio material study
  public static manageBioMaterialStudiesUrl = 'biomaterial/manage';
  public static newBioMaterialStudyUrl = 'biomaterial/new';
  public static browseBioMaterialStudiesUrl = 'biomaterial/browse';

  // tendons study
  public static manageTendonsStudiesUrl = 'tendons/manage';
  public static newTendonsStudyUrl = 'tendons/new';
  public static browseTendonStudiesUrl = 'tendons/browse';
  public static tendonsStudyUrl = 'tendons/:id';

  public static replaceStudyId(url: string, studyId: string) {
    return url.replace(':id', studyId);
  }
}
