export class AppUrls {
  public static welcomeUrl = 'welcome';
  public static aboutUrl = 'about';
  public static faqUrl = 'faq';
  public static uploadUrl = 'upload';
  public static metadataUrl = 'metadata';
  public static studiesUrl = 'studies';
  public static browseBiomaterialUrl = 'browse/biomaterial';
  public static browseTendonsUrl = 'browse/tendons';
  public static newTendonsStudyUrl = 'tendons/new';
  public static tendonsStudyUrl = 'tendons/:id';
  public static manageTendonsStudiesUrl = 'manage_tendons';
  public static usersUrl = 'users';
  public static studyUrl = 'study/:id';
  public static peopleUrl = 'people';

  public static replaceStudyId(url: string, studyId: string) {
    return url.replace(':id', studyId);
  }
}
