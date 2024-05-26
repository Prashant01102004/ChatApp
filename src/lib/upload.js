import {storage} from './firebase';
import { getDownloadURL,ref,uploadBytesResumable } from 'firebase/storage';


const upload =async (file)=>{

    const metadata = {
        contentType: 'image/jpeg'
      };
      
      const date=new Date()

      const storageRef = ref(storage, `images/${date}+file.name`);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      return new Promise((resolve, reject)=>{
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {

            reject("Something went wrong"+error.code);
          switch (error.code) {
            case 'storage/unauthorized':
              break;
            case 'storage/canceled':
              break;
      
      
            case 'storage/unknown':
              break;
          }
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
            console.log('File available at', downloadURL);
          });
        }
      );
      });
}

export default upload;