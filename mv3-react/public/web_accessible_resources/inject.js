// alert('inject')

const doc = document.documentElement
const interval = setInterval(() => {
    if (doc.scrollTop >= 1000) {
        clearInterval(interval)
    } else {
        doc.scrollTop += 2
    }
}, 50)
