Name:		zbxtable-web
Version:	%{version}
Release: 	1%{?alphatag:.%{alphatag}}%{?dist}
Summary:	Zbxtable Web
Group:		Applications/Internet
License:	Apache-2.0
URL:		https://zbxtable.cactifans.com
Source0:	zbxtable-web-%{version}%{?alphatag:%{alphatag}}.tar.gz

Buildroot:	%{_tmppath}/zbxtable-web-%{version}-%{release}-root-%(%{__id_u} -n)

%description
Zbxtable Web

%global debug_package %{nil}

%prep
%setup0 -q -n zbxtable-web-%{version}%{?alphatag:%{alphatag}}

%build

%install

rm -rf $RPM_BUILD_ROOT

# install necessary directories
mkdir -p $RPM_BUILD_ROOT%{_prefix}/local/zbxtable/web

# install  binaries and conf
cp -a * $RPM_BUILD_ROOT%{_prefix}/local/zbxtable/web

exit 0

%clean
rm -rf $RPM_BUILD_ROOT

%define __debug_install_post   \
   %{_rpmconfigdir}/find-debuginfo.sh %{?_find_debuginfo_opts} "%{_builddir}/%{?buildsubdir}"\
%{nil}

%files
%defattr(755,nginx,nginx,755)
%{_prefix}/local/zbxtable/web