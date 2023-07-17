const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')
const jsonOutput = document.getElementById('jsonOutput')
const dd = document.getElementById('dd')

const logout = document.getElementById('logout')

// Get the elements we need
const counterElement = document.getElementById('counter');


logout.addEventListener('click', () =>{
  console.log('jerjerj');
});

btn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    // filePathElement.innerText = filePath
    // const json = JSON.stringify(filePath, null, 2);
    // filePathElement.innerText = json
    // console.log(filePath[0])
    


    // var namelist = [];

    // filePath.forEach((value, index) => {

    //     if (index > 0) {
    //         // setTimeout(() => {


            
            



    //             namelist.push(value._0);
    //             // console.log(index, value._0);
                
    //             var h6 = document.createElement('h3');
    //             h6.setAttribute('id', index);

    //             var text = document.createTextNode(value._0);
    //             h6.appendChild(text);

    //             document.querySelector('#jsonOutput').appendChild(h6);

    //         // }, 2000); // Delay execution for 1 second (1000 milliseconds)

    //     }

    //   });
      
    //   const dd = filePath;
    //  ipcRenderer.send('test:msg', {dd}  )
    //  dd.innerText = res
    //  console.log('res', res)

      
    // ipcRenderer.send('read-csv', filePath)
    // const filePath = await window.electronAPI.openFile()

    // create file
    // const data = 'Hello, world!';
    // fs.writeFile('file.txt', data, (err) => {
    // if (err) {
    //     console.error(err);
    // } else {
    //     console.log('File written successfully!');
    // }
    // });

    // read csv file
    // const csvFileStream = fs.readFileSync(filePath).pipe(csv.parseStream);
    // csvFileStream.on('data', (data) => {
    // console.log(data);
    // });

})

// action.addEventListener('click', async () => {


// })

ipcRenderer.on('pdf:done', (event, data) => {
    console.log('test:msg', data)
})

ipcRenderer.on('test:response', (event, message) => {
    // Do something with the response message
    console.log(message);
  });
// ipcRenderer.on('pdf:done', (event) => {
// console.log('Finished reading CSV file')
// })



$(document).ready(() => {
    $('#myButton').click(() => {
      console.log('Button clicked!');

      ipcRenderer.send('test:test', 'Option value');

    //   $.ajax({
    //     url: 'process-data',
    //     type: 'POST',
    //     data: { key1: 'value1', key2: 'value2' },
    //     contentType: "application/json",
    //     success: function(response) {
    //       console.log('Response:', response);
    //     },
    //     error: function(error) {
    //       console.log('Error:', error);
    //     }
    //   });

    // var data = { foo: 'bar' };
    // $.ajax({
    //     type: "POST",
    //     url: "process-data",
    //     data: JSON.stringify(data),
    //     contentType: "application/json",
    //     success: function(result) {
    //       console.log(result);
    //     },
    //     error: function(xhr, status, error) {
    //       console.error(status, error);
    //     }
    //   });

    });
  });


  // Listen for the 'update-page' message
// ipcRenderer.on('update-page', (event, html) => {
//     // Update the contents of the page
//     document.body.innerHTML = html;
//   });


//   ipcRenderer.on('counter-updated', (event, counter) => {
//     counterElement.innerText = counter;
//     console.log(counter);
//   });
  
//   document.getElementById('increment-button').addEventListener('click', () => {
//     ipcRenderer.send('increment-counter');
//   });
  
//   document.getElementById('reset-button').addEventListener('click', () => {
//     ipcRenderer.send('reset-counter');
//   });