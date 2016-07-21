const lowerCaseFirst = str => str.charAt(0).toLowerCase() + str.slice(1)

export default function eventCaller(req, retries) {

  let tries = 0

  //Event request loop
  let iterator = (since) => {

    let attr = [{key: 'since', val: since}]

    req({method: 'events', endpoint: false, attr}).then((eventArr) => {

      //Check for event count on first request iteration
      if (since != 0) {
        eventArr.forEach((e) => {
          this.emit(lowerCaseFirst(e.type), e.data)
        })
      }

      //Update event count
      since = eventArr[eventArr.length -1].id

      //Reset tries
      tries = 0

      setTimeout(() => iterator(since), 100)

    }).catch((err) => {
      this.emit('error', err)

      //Try to regain connection & reset event counter
      if(tries < retries){
        tries++
        setTimeout(() => iterator(0), 500)
      }
    })
  }

  iterator(0)
}
