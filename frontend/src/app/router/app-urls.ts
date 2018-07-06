export class AppUrls {
  public static welcomeUrl = 'welcome';
  public static aboutUrl = 'about';
  public static faqUrl = 'faq';
  public static browseUrl = 'browse';
  public static downloadUrl = 'download';
  public static uploadUrl = 'upload';
  public static metadataUrl = 'metadata';
  public static studiesUrl = 'studies';
  public static usersUrl = 'users';
  public static studyUrl = 'study/:id';

  public static replaceStudyId(url: string, studyId: string) {
    return url.replace(':id', studyId);
  }
}
