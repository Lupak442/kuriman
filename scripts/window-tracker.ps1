Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Diagnostics;

public class WinTracker {
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool SetProcessDPIAware();

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsZoomed(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll")]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("dwmapi.dll")]
    public static extern int DwmGetWindowAttribute(IntPtr hwnd, int dwAttribute, out RECT pvAttribute, int cbAttribute);

    [DllImport("dwmapi.dll")]
    public static extern int DwmGetWindowAttribute(IntPtr hwnd, int dwAttribute, out int pvAttribute, int cbAttribute);

    const int GWL_EXSTYLE = -20;
    const int WS_EX_TOOLWINDOW = 0x00000080;
    const int WS_EX_TRANSPARENT = 0x00000020;
    const int DWMWA_EXTENDED_FRAME_BOUNDS = 9;
    const int DWMWA_CLOAKED = 14;

    public static string GetWindowsJson(int selfPid) {
        IntPtr fgHwnd = GetForegroundWindow();
        var list = new List<string>();
        int zOrder = 0;

        EnumWindows((hWnd, lParam) => {
            try {
                if (!IsWindowVisible(hWnd) || IsIconic(hWnd)) return true;

                int cloaked = 0;
                DwmGetWindowAttribute(hWnd, DWMWA_CLOAKED, out cloaked, sizeof(int));
                if (cloaked != 0) return true;

                int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
                if ((exStyle & WS_EX_TOOLWINDOW) != 0) return true;

                int len = GetWindowTextLength(hWnd);
                if (len <= 0) return true;

                uint pid = 0;
                GetWindowThreadProcessId(hWnd, out pid);
                if (selfPid > 0 && pid == selfPid) return true;

                StringBuilder sb = new StringBuilder(len + 1);
                GetWindowText(hWnd, sb, sb.Capacity);
                string title = sb.ToString();
                if (string.IsNullOrWhiteSpace(title)) return true;
                if (title == "Program Manager" || title == "쿠리만쥬 시메지 타이머" || title == "Windows 입력 환경") return true;

                string procName = "";
                try {
                    procName = Process.GetProcessById((int)pid).ProcessName.ToLowerInvariant();
                } catch {}

                if (procName == "applicationframehost" || procName == "textinputhost" || procName == "shellexperiencehost" || procName == "searchhost") {
                    return true;
                }

                RECT r;
                if (DwmGetWindowAttribute(hWnd, DWMWA_EXTENDED_FRAME_BOUNDS, out r, Marshal.SizeOf(typeof(RECT))) != 0) {
                    if (!GetWindowRect(hWnd, out r)) return true;
                }

                int w = r.Right - r.Left;
                int h = r.Bottom - r.Top;
                if (w < 160 || h < 100) return true;

                bool isFg = (hWnd == fgHwnd);
                bool isMax = IsZoomed(hWnd);
                string safeTitle = title.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "");
                string safeProc = procName.Replace("\\", "\\\\").Replace("\"", "\\\"");

                list.Add(string.Format(
                    "{{\"hwnd\":\"{0}\",\"title\":\"{1}\",\"proc\":\"{2}\",\"x\":{3},\"y\":{4},\"width\":{5},\"height\":{6},\"isForeground\":{7},\"isMaximized\":{8},\"z\":{9}}}",
                    hWnd.ToInt64(), safeTitle, safeProc, r.Left, r.Top, w, h,
                    isFg ? "true" : "false",
                    isMax ? "true" : "false",
                    zOrder
                ));
                zOrder++;
            } catch {}
            return true;
        }, IntPtr.Zero);

        return "[" + string.Join(",", list) + "]";
    }
}
'@

[WinTracker]::SetProcessDPIAware() | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$myPid = 0
$once = $false
foreach ($arg in $args) {
    if ($arg -eq "--once") {
        $once = $true
    } else {
        $myPid = [int]$arg
    }
}

if ($once) {
    [Console]::WriteLine([WinTracker]::GetWindowsJson($myPid))
    exit 0
}

while ($true) {
    try {
        $json = [WinTracker]::GetWindowsJson($myPid)
        [Console]::WriteLine($json)
    } catch {
        [Console]::WriteLine("[]")
    }
    Start-Sleep -Milliseconds 350
}
