import React from "react"
import { makeStyles, Theme } from "@mui/material/styles"
import grey from "@mui/material/colors/grey"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import { TransitionProps } from "@mui/material/transitions"
import Datepicker from "../engine_components/Datepicker"

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />
})

const useStyles = makeStyles((theme: Theme) => ({
    datepicker: {
        // minWidth: 124,
        flexBasis: 230,
        marginLeft: theme.spacing(1),
        "&:hover": {
            backgroundColor: grey[100],
        },
    },
}))
function TempMain() {
    const classes = useStyles()

    const [open, setOpen] = React.useState(false)

    function handleClickOpen() {
        setOpen(true)
    }

    function handleClose() {
        setOpen(false)
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", padding: 20, width: "100%" }}>
            <Datepicker styleCls={classes.datepicker} label='Begin' dateFormat='dddd, DD MMM YYYY' />
            <div>
                <Button variant='outlined' color='primary' onClick={handleClickOpen}>
                    Slide in alert dialog
                </Button>
                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    aria-labelledby='alert-dialog-slide-title'
                    aria-describedby='alert-dialog-slide-description'
                >
                    <DialogTitle id='alert-dialog-slide-title'>{"Use Google's location service?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-slide-description'>
                            Let Google help apps determine location. This means sending anonymous location data to
                            Google, even when no apps are running.
                        </DialogContentText>
                        <Datepicker styleCls={classes.datepicker} label='Begin' dateFormat='DD/MM/YYYY' />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color='primary'>
                            Disagree
                        </Button>
                        <Button onClick={handleClose} color='primary'>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    )
}

export default TempMain
