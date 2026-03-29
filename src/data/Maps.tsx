export const GetMapLocationInfo = async(apiKey, coordinates, radius) : Promise<any[]>  => {

    return new Promise((resolve, reject) => {
        const pageToken = "";
        const url = `/maps/api/place/nearbysearch/json?keyword=masjid&location=${coordinates.lat}%2C${coordinates.lng}&radius=${radius}&type=mosque&key=${apiKey}&pageToken=${pageToken}`
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data.results);
                } else {
                    reject(new Error(`Request failed with status ${xhr.status}`));
                }
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error"));
        };

        xhr.send();
    })

        // try {
        //    // console.log("fetch data method");
        //     const pageToken = "";

        //     const url = `/maps/api/place/nearbysearch/json?keyword=masjid&location=${coordinates.lat}%2C${coordinates.lng}&radius=${radius}&type=mosque&key=${apiKey}&pageToken=${pageToken}`
        //     const xhr = new XMLHttpRequest();
        //     let results: any[];

        //     xhr.onreadystatechange = function () {
        //         if (xhr.readyState === 4) {
        //             if (xhr.status === 200) {
        //                 const data = JSON.parse(xhr.responseText);
        //                 results = data.results;
        //                 return data;
        //             } else {
        //                 console.error(`HTTP error! Status: ${xhr.status}`);
        //             }
        //         }
        //     };
            
        //     xhr.open('GET', url, true);
        //     xhr.setRequestHeader('Content-Type', 'application/json');
        //     xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

        //     xhr.send();
        //     return results;
        // } catch (error) {
        //     console.error('Error fetching nearby places:', error);
        // }
  };